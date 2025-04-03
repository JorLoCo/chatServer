import { Server, Socket } from "socket.io";

export function handleSockets(io: Server) {
    io.on("connection", (socket: Socket) => {
        console.log("Usuario conectado:", socket.id);

        setTimeout(() => {
            socket.emit("connected", {socketID: socket.id, message: "Te conectaste!" });
        }, 1000);

        io.emit("message", {
            socketID: "server",
            message: `Bienvenido ${socket.id} al chat!`
        });
        const clientIp = socket.handshake.address.replace(/^.*:/, ''); // quitar prefijo ipv6;
        const TimeMessage = socket.handshake.time
        socket.on("message", (data) => {
            console.log(`${socket.id}:${ data } desde ${clientIp} a la hora de ${TimeMessage}]`);
            io.emit("message",{
                socketID: socket.id, 
                message: data
            }); //Enviar mensaje a todos
        });

        socket.on("disconnect", () => {
            console.log("Usuario desconectado:", socket.id);
            io.emit("message", {
                socketID: "server",
                message: `Adios ${socket.id}, que le vaya bien en el bote`
            });
        });
    });
}