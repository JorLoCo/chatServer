import { Server, Socket } from "socket.io";

export function handleSockets(io: Server) {
    io.on("connection", (socket: Socket) => {
        console.log("Usuario conectado:", socket.id);

        setTimeout(() => {
            socket.emit("connected", {socketID: socket.id, message: "Te conectaste!" });
        }, 1000);

        socket.on("message", (data) => {
            console.log('${socket.id}:${ data }');
            io.emit("message",{
                socketID: socket.id, 
                message: data
            }); // Enviar mensaje a todos
        });

        socket.on("disconnect", () => {
            console.log("Usuario desconectado:", socket.id);
        });
    });

}