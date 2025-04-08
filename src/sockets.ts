import { Server, Socket } from "socket.io";

// Lista de IPs bloqueadas
const blockedIPs = new Set([
    "10.180.22.181"
]);

export function handleSockets(io: Server) {
    io.on("connection", (socket: Socket) => {
        const user = socket.handshake.query.user || "desconocido";
        const clientIp = socket.handshake.address.replace(/^.*:/, ''); // quitar prefijo ipv6
        const TimeMessage = socket.handshake.time;

        // Verificar si la IP está bloqueada
        if (blockedIPs.has(clientIp)) {
            console.log(`Conexión rechazada para IP bloqueada: ${clientIp} (Usuario: ${user})`);
            socket.emit("blocked", { message: "Tu IP está bloqueada y no puedes enviar mensajes." });
            socket.disconnect(true); // Desconectar inmediatamente
            return;
        }

        console.log("Usuario conectado:", socket.id, " llamado: ", user, " con la ip: ", clientIp, " en la fecha de ", TimeMessage);

        setTimeout(() => {
            socket.emit("connected", {socketID: socket.id, message: "Te conectaste!" });
        }, 1000);

        io.emit("message", {
            socketID: "server",
            message: `Bienvenido ${socket.id} al chat!`
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
                message: `Adios ${socket.id}, que le vaya bien en el bote`
            });
        });
    });
}