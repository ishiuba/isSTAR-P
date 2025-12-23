const sqlite3 = require("sqlite3").verbose();
const caminhoBanco = "./atualizacoes.db";

class BancoDados {
  constructor() {
    this.banco = null;
  }

  conectar() {
    return new Promise((resolver, rejeitar) => {
      this.banco = new sqlite3.Database(caminhoBanco, (erro) => {
        if (erro) {
          rejeitar(erro);
        } else {
          resolver();
        }
      });
    });
  }

  inicializarTabelas() {
    return new Promise((resolver, rejeitar) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS atualizacoes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          versao TEXT NOT NULL UNIQUE,
          titulo TEXT NOT NULL,
          conteudo TEXT NOT NULL,
          link_preview TEXT,
          prefixo TEXT,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      this.banco.run(sql, (erro) => {
        if (erro) {
          rejeitar(erro);
        } else {
          resolver();
        }
      });
    });
  }

  inserirAtualizacao(atualizacao) {
    return new Promise((resolver, rejeitar) => {
      const sql = `
        INSERT OR REPLACE INTO atualizacoes (versao, titulo, conteudo, link_preview, prefixo, data_atualizacao)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;

      const prefixo = this.extrairPrefixo(atualizacao.version);

      this.banco.run(
        sql,
        [
          atualizacao.version,
          atualizacao.title,
          atualizacao.content,
          atualizacao.preview_link || null,
          prefixo,
        ],
        function (erro) {
          if (erro) {
            rejeitar(erro);
          } else {
            resolver(this.lastID);
          }
        }
      );
    });
  }

  extrairPrefixo(versao) {
    if (versao.includes("-")) {
      return versao.split("-")[0];
    }
    return "dj";
  }

  obterTodasAtualizacoes() {
    return new Promise((resolver, rejeitar) => {
      const sql = "SELECT * FROM atualizacoes ORDER BY id DESC";

      this.banco.all(sql, [], (erro, linhas) => {
        if (erro) {
          rejeitar(erro);
        } else {
          resolver(linhas);
        }
      });
    });
  }

  obterAtualizacaoPorVersao(versao) {
    return new Promise((resolver, rejeitar) => {
      const sql = "SELECT * FROM atualizacoes WHERE versao = ?";

      this.banco.get(sql, [versao], (erro, linha) => {
        if (erro) {
          rejeitar(erro);
        } else {
          resolver(linha);
        }
      });
    });
  }

  obterAtualizacoesPorPrefixo(prefixo) {
    return new Promise((resolver, rejeitar) => {
      const sql =
        "SELECT * FROM atualizacoes WHERE prefixo = ? ORDER BY id DESC";

      this.banco.all(sql, [prefixo], (erro, linhas) => {
        if (erro) {
          rejeitar(erro);
        } else {
          resolver(linhas);
        }
      });
    });
  }

  deletarAtualizacao(id) {
    return new Promise((resolver, rejeitar) => {
      const sql = "DELETE FROM atualizacoes WHERE id = ?";

      this.banco.run(sql, [id], function (erro) {
        if (erro) {
          rejeitar(erro);
        } else {
          resolver(this.changes);
        }
      });
    });
  }

  limparTodasAtualizacoes() {
    return new Promise((resolver, rejeitar) => {
      const sql = "DELETE FROM atualizacoes";

      this.banco.run(sql, (erro) => {
        if (erro) {
          rejeitar(erro);
        } else {
          resolver();
        }
      });
    });
  }

  fechar() {
    return new Promise((resolver, rejeitar) => {
      if (this.banco) {
        this.banco.close((erro) => {
          if (erro) {
            rejeitar(erro);
          } else {
            resolver();
          }
        });
      } else {
        resolver();
      }
    });
  }
}

module.exports = BancoDados;
