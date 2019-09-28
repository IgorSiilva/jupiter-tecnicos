const SQLite = require('react-native-sqlite-storage')

const db = SQLite.openDatabase({ name: "OS", createFromLocation: "1" });

const iniciarAtendimento = (dados) => {
    db.transaction((tx) => {
        tx.executeSql(`UPDATE OS SET inicioatendimento = "${dados.data}", latitudeInicio = ${dados.posicao.latitude}, longitudeInicio = ${dados.posicao.longitude}, emAndamento = ${1} WHERE idordem = ${dados.ordem.idordem}`, [], (tx, results) => {
        });
    });
}


const cancelarAtendimento = (idordem) => {
    db.transaction((tx) => {
        tx.executeSql(`UPDATE OS SET emAndamento = ${0}, inicioatendimento = "" WHERE idordem = ${idordem}`, [], (tx, results) => {
        });
    })
}

const finalizarAtendimento = async (dados, assinatura, usuario) => {
    db.transaction((tx) => {
        tx.executeSql(`UPDATE OS SET emAndamento = ${0}, finalizada = ${1}, fimatendimento = "${dados.data}", latitudeTermino = "${dados.posicao.latitude}", longitudeTermino = "${dados.posicao.longitude}", status = ${dados.finalizacaoStatus}, historico = "${dados.historico}", assinatura = "${assinatura}", usuariofo = "${usuario}", descricao_status = "concluido", nomeDoAssinante = "${dados.nomeDoAssinante}", cpfDoAssinante = "${dados.cpfDoAssinante}", presencaDoTitular = ${Number(dados.presencaDoTitular)}, solucao = ${dados.solucao}, acessoRemoto = ${Number(dados.acessoRemotoHabilitado)}, fotoDoMapa = "${dados.fotoDoMapa}",  terminalSelecionado = "${dados.caixaAtendimentoSelecionada}", distanciaTerminalSelecionado = "${dados.caixaAtendimentoSelecionada.distancia}" WHERE idordem = ${dados.ordem.idordem}`, [], (tx, results) => {
        });
    });
}

const finalizarViabilidade = async(dados, usuario) => {
    //console.log(dados)
    db.transaction((tx) => {
        tx.executeSql(`UPDATE OS SET emAndamento = ${0}, finalizada = ${1}, fimatendimento = "${dados.data}", latitudeTermino = "${dados.posicao.coords.latitude}", longitudeTermino = "${dados.posicao.coords.longitude}", usuariofo = "${usuario}", descricao_status = "concluido", terminalSelecionado = "${dados.terminalSelecionado.codigo}", distanciaTerminalSelecionado = "${dados.terminalSelecionado.distancia}", drops = ${dados.viabilidade.drops}, esticadores = ${dados.viabilidade.esticadores}, fotoDoMapa = "${dados.imagemMapa}", historico = "${dados.historico}", roteadorCliente = "${dados.viabilidade.roteadorCliente}" WHERE idordem = ${dados.ordem.idordem}`, [], (tx, results) => {
            //console.log(results)
        });
    });
}

const inserirOS = async (dados) => {
    db.transaction((tx) => {
        tx.executeSql(`INSERT INTO OS (id, idordem, servico, nomecliente, tipo_servico, endereco, sistema) VALUES (${dados.id}, "${dados.idordem}", "${dados.servico}", "${dados.nomecliente}", ${dados.tipo_servico}, "${dados.endereco}", "${dados.sistema}")`, [], (tx, results) => {
        });
    });
}

const removerOS = async (dados) => {
    db.transaction((tx) => {
        tx.executeSql(`DELETE FROM OS WHERE idordem = ${dados.idordem}`, [], (tx, results) => {
        });
    });
}



const buscarOSEspecifica = async (idordem) => {
    return new Promise(resolve => {
        db.transaction( async (tx) => {
            return tx.executeSql(`SELECT * FROM OS WHERE idordem = ${idordem}`, [], (tx, results) => (
                resolve(results.rows.raw())
            ));
        });
    })
}

const buscarImagemOS = async (idatendimento) => {
    return new Promise(resolve => {
        db.transaction((tx) => {
            return tx.executeSql(`SELECT fotosViabilidade.* FROM OS LEFT JOIN fotosViabilidade ON OS.id = fotosViabilidade.id WHERE OS.finalizada = ${1} AND OS.id = ${idatendimento}`, [], (tx, results) => {
                resolve(results.rows.raw());
            })
        })
    })
}


const salvarFoto = async (id, arrayFotos) => {
    arrayFotos.map(foto => {
        return db.transaction( async (tx) => {
            return tx.executeSql(`INSERT INTO fotosViabilidade (foto, id) VALUES ("${foto}", ${id})`, [], (tx, results) => {
            });
        });
    })
}

const removerFotos = async (id) => {
    return db.transaction( async (tx) => {
        return tx.executeSql(`DELETE FROM fotosViabilidade WHERE id = ${id}`, [], (tx, results) => {
        });
    });
}


const buscarOrdemERemover = async (idordem, idatendimento) => {
    return db.transaction(async (tx) => {
        return tx.executeSql(`SELECT * FROM OS WHERE idordem = ${idordem}`, [], (tx, results) => {
            /* const OS = results.rows.raw(); */
            return db.transaction((tx) => {
                return tx.executeSql(`SELECT fotosViabilidade.* FROM OS LEFT JOIN fotosViabilidade ON OS.id = fotosViabilidade.id WHERE OS.finalizada = ${1} AND OS.id = ${idatendimento}`, [], (tx, results) => {
                    return results.rows.raw();
                })
            })
        })
    })
}


export { iniciarAtendimento, finalizarAtendimento, inserirOS, removerOS, buscarOSEspecifica, salvarFoto, finalizarViabilidade, removerFotos, cancelarAtendimento, buscarOrdemERemover, buscarImagemOS }