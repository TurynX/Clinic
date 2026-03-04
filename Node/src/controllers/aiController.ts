import { FastifyReply, FastifyRequest } from "fastify";
import axios from "axios";
import Formdata from "form-data";

export async function pdfConntroller(req: FastifyRequest, rep: FastifyReply) {
  const data = await req.file();
  if (!data) {
    return rep.status(400).send({ error: "File not found" });
  }
  const buffer = await data.toBuffer();
  const formData = new Formdata();
  formData.append("file", buffer, { filename: data.filename });

  const pythonResponse = await axios.post(
    "https://clinic-ss2c.onrender.com/upload",
    formData,
    { headers: formData.getHeaders() },
  );

  return { status: pythonResponse.status };
}

export async function askToAiController(
  req: FastifyRequest,
  rep: FastifyReply,
) {
  const { question } = req.body as { question: string };
  if (!question) {
    return rep.status(400).send({ error: "Question not found" });
  }

  const aiResponse = await axios.post("https://clinic-ss2c.onrender.com/chat", {
    question,
  });

  return { Response: aiResponse.data.response };
}
