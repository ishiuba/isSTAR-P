import axios from "axios";

// Também só isso!
const resposta = await axios.get("http://localhost:3000/api/atualizacoes");
console.log(resposta.data.atualizacoes);
