const db = require("../database/db")

const crypto = require("crypto")

const obterTodasAsAlunas = async (req, res) => {
   try {
     const alunas = await db()

     const { nome, cidade, bairro, pai, mae } = req.query 

     let alunasFiltradas = alunas.slice()
  
     if (nome) {
        alunasFiltradas = alunasFiltradas.filter(alunaAtual => {
            const nome_registro = alunaAtual.nome_registro.toLowerCase()
            
            let nome_social = alunaAtual.nome_social

            if (nome_social)  { 
              nome_social = nome_social.toLowerCase()
              return nome_social.includes(nome) || nome_registro.includes(nome)
            }
            return  nome_registro.includes(nome) 
        })
     }

     if (cidade) {
       alunasFiltradas = alunasFiltradas.filter(alunaAtual => {
          return alunaAtual.cidade == cidade
       })
     }

     if (bairro) {
       alunasFiltradas = alunasFiltradas
       .filter(alunaAtual => alunaAtual.bairro == bairro)
     }

     if (mae) {
      alunasFiltradas = alunasFiltradas.filter(alunaAtual => {
        return alunaAtual.mae.toLowerCase().includes(mae.toLowerCase())
      })
     }

     if (pai) {
      alunasFiltradas = alunasFiltradas.filter(alunaAtual => {
        return alunaAtual.pai.toLowerCase().includes(pai.toLowerCase())
      })
     }

     res.status(200).send(alunasFiltradas)
   } catch (error) {
      res.status(500).send({
        message: error.message
      })
   }
}

const obterAlunaPorId = async (req, res) => {
  const { id } = req.params

  try {
    const alunas = await db()
  
    const alunaEncontrada = alunas
      .find(alunaAtual => alunaAtual.id == id)

    if( !alunaEncontrada ) {
      return res.status(404).send("Aluna não encontrada");
    }

    res.status(200).send(alunaEncontrada);

  } catch (error) {
    res.status(500).send({ message: error.message })
  }
}

const obterNotas = async (req, res) => {
  const { id } = req.params

  try {
    const alunas = await db()
  
    const alunaEncontrada = alunas
    .find(alunaAtual => alunaAtual.id == id)

    const notas = alunaEncontrada.notas
    const { 
      ciencias_da_natureza, ciencias_humanas, linguagens_codigos,
      matematica, redacao
     } = notas

    const resposta = {
      ciencias_da_natureza,
      ciencias_humanas,
      linguagens_codigos,
      matematica,
      redacao,
      turma: alunaEncontrada.turma,
      nome: alunaEncontrada.nome_social || alunaEncontrada.nome_registro
    }

    res.status(200).send(resposta)

  } catch (error) {
    res.status(500).send({ message: error.message })
  }
}

const obterBoletim = async (req, res) => {
  try {
    const { turma } = req.params
    const alunas = await db()
    const alunasDaTurma = alunas.filter( a=> a.turma.toLowerCase() == turma );
    if (alunasDaTurma.length == 0) {
      return res.status(404).json({ message: `Turma ${turma} inexiste ou está sem alunos.` })
    }
    const entradasBoletim = alunasDaTurma.map( a => {
      const notas = Object.values(a.notas);
      const media = notas.reduce( (soma, nota) => parseFloat(nota) + soma, 0 ) / notas.length;
      let situacao = "";
      if( media >= 6) {
        situacao = "APROVADA";
      } else if( media >= 5) {
        situacao = "RECUPERACAO";
      } else {
        situacao = "REPROVADA";
      };

      let res = {
        "situacao" : situacao,
        "media" : media,
        "nome" : a.nome_registro,
        "turma": req.params.turma
      };

      res = Object.assign(res, a.notas);

      return res;

    } );

    res.status(200).send(entradasBoletim);
  } catch (error) {
    res.status(500).send({
     message: error.message
    })
  }
}

const criarAluna = async (req, res) => {
   try {
     const alunas = await db()

     const alunaBody = req.body
     const { rg, cpf, email, nome_registro } = alunaBody
    
     if (rg == undefined) return res.status(400).send({
      message: "Rg é obrigario"
     })
     if (cpf == undefined) return res.status(400).send({
      message: "Cpf é obrigatorio"
     }) 
     if (email == undefined || email.includes("@") == false) {
      return res.status(400).send({
        message: "email obrigario"
       })
     }
     if (nome_registro == undefined) return res.status(400).send({
       message: "O nome de registro é obrigario"
     })

     alunaBody.id = crypto.randomUUID()

     alunas.push(alunaBody)

     res.status(201).send(alunaBody)
   } catch (error) {
     res.status(500).send({
      message: error.message
     })
   }
}

const atualizarAluna = async (req, res) => {

}

const deletarAluna = async (req, res) => {

}

module.exports = {
  deletarAluna,
  criarAluna,
  atualizarAluna,
  obterTodasAsAlunas,
  obterAlunaPorId,
  obterNotas,
  obterBoletim
}