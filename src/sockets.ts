import { Server, Socket } from "socket.io";

// Lista de IPs bloqueadas
const blockedIPs = new Set([
    "10.180.22.181"
]);

export function handleSockets(io: Server) {
    const connectedUsers:Map<string, string> = new Map<string, string>();
    io.on("connection", (socket: Socket) => {
        const user = socket.handshake.query.user as string || "desconocido";
        const clientIp = socket.handshake.address.replace(/^.*:/, ''); // quitar prefijo ipv6
        const TimeMessage = socket.handshake.time;
        connectedUsers.set(socket.id, user);

        io.emit('users:update', {users: [...connectedUsers.values()]});

        // Verificar si la IP está bloqueada
        if (blockedIPs.has(clientIp)) {
            console.log(`Conexión rechazada para IP bloqueada: ${clientIp} (Usuario: ${user})`);
            socket.emit("blocked", { message: "Tu IP está bloqueada y no puedes enviar mensajes." });
            socket.disconnect(true);
            return;
        }

        console.log("Usuario conectado:", socket.id, " llamado: ", user, " con la ip: ", clientIp, " en la fecha de ", TimeMessage);

        setTimeout(() => {
            socket.emit("connected", {socketID: socket.id, message: "Te conectaste!" });
        }, 1000);

        io.emit("message", {
            socketID: "server",
            message: `Bienvenido ${user} al chat!`
        });

        socket.on("message", (data) => {
            // Verificar nuevamente por si acaso (aunque la conexión ya estaría bloqueada)
            if (blockedIPs.has(clientIp)) {
                console.log(`Intento de mensaje desde IP bloqueada: ${clientIp}`);
                return;
            }

            console.log(`Mensaje de ${user}: ${data} desde ${clientIp} a la hora de ${TimeMessage}`);
            io.emit("message", {
                socketID: socket.id, 
                user,
                message: data
            });
        });

        socket.on("disconnect", () => {
            console.log("Usuario desconectado:", socket.id, "a la fecha y hora de: ", TimeMessage);
            io.emit("message", {
                socketID: "server",
                message: `Adios ${user}, que le vaya bien en el bote`
            });
            connectedUsers.delete(socket.id)
            io.emit('users:update', {users: [...connectedUsers.values()]});
        });
    });
}