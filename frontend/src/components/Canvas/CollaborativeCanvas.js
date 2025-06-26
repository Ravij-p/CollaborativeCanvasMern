import { useParams } from "react-router-dom";
import Canvas from "./Canvas";
const CollaborativeCanvas = () => {
  const { id: roomId } = useParams();
  return (
    <div>
      <h2>Room: {roomId}</h2>
      <Canvas roomId={roomId} />
    </div>
  );
};

export default CollaborativeCanvas;
