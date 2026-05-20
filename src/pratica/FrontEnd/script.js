// URL base da API — porta 3001 conforme main.ts
const API_URL = "http://localhost:3001";

// ── Inicialização ──────────────────────────────────────────────────────────────
window.onload = function () {
    carregarEstatisticas();
    buscarHistorico();
};

// ── Helpers HTTP ───────────────────────────────────────────────────────────────
function callAPI(url, method, callback, data) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    if (method === "POST" || method === "PATCH" || method === "PUT") {
        xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    }
    xhr.onload = function () {
        var parsed = null;
        try { parsed = JSON.parse(xhr.response); } catch (e) { /* não-JSON */ }
        callback(xhr.status, parsed);
    };
    xhr.onerror = function () {
        callback(0, null); // erro de rede / CORS / servidor fora
    };
    if (data) {
        xhr.send(JSON.stringify(data));
    } else {
        xhr.send();
    }
}

// ── Estatísticas ───────────────────────────────────────────────────────────────
function carregarEstatisticas() {
    var container = document.getElementById("estatisticas-container");
    container.innerHTML = "<p class='loading'>Carregando estatísticas...</p>";

    callAPI(API_URL + "/estatisticas", "GET", function (status, data) {
        if (status === 200 && data) {
            var html = "<div class='stats-grid'>";
            html += "<div class='stat-card'><span class='stat-valor'>" + data.totalGeralDePraticas + "</span><span class='stat-label'>Total de Práticas</span></div>";
            html += "<div class='stat-card'><span class='stat-valor'>" + (data.tipoDePraticaMaisRegistrada || "—") + "</span><span class='stat-label'>Tipo Mais Registrado</span></div>";
            html += "<div class='stat-card'><span class='stat-valor'>" + (data.usuarioComMaisRegistros || "—") + "</span><span class='stat-label'>Usuário Mais Ativo</span></div>";
            html += "<div class='stat-card'><span class='stat-valor'>" + data.mediaDiariaDeRegistrosUltimos30Dias + "</span><span class='stat-label'>Média Diária (30 dias)</span></div>";
            html += "</div>";

            if (data.totalDePraticasPorTipo && data.totalDePraticasPorTipo.length > 0) {
                html += "<div class='tipo-lista'><h3>Práticas por tipo</h3><ul>";
                data.totalDePraticasPorTipo.forEach(function (item) {
                    html += "<li><span class='tipo-nome'>" + item.tipo + "</span><span class='tipo-total'>" + item.total + "</span></li>";
                });
                html += "</ul></div>";
            }

            container.innerHTML = html;
        } else {
            container.innerHTML = "<p class='erro'>Não foi possível carregar as estatísticas. Verifique se a API está rodando.</p>";
        }
    });
}

// ── Cadastro de nova prática ───────────────────────────────────────────────────
function cadastrarPratica() {
    var nomeUsuario = document.getElementById("nomeUsuario").value.trim();
    var tipo        = document.getElementById("tipo").value.trim();
    var data        = document.getElementById("data").value;
    var descricao   = document.getElementById("descricao").value.trim();
    var msgEl       = document.getElementById("msg-cadastro");
    var btnEl       = document.getElementById("btn-cadastrar");

    if (!nomeUsuario || !tipo || !data) {
        mostrarMensagem(msgEl, "❌ Preencha os campos obrigatórios: Nome, Tipo e Data.", "erro");
        return;
    }

    var payload = { nomeUsuario: nomeUsuario, tipo: tipo, data: data };
    if (descricao) payload.descricao = descricao;

    btnEl.disabled = true;
    btnEl.textContent = "Enviando...";
    mostrarMensagem(msgEl, "", "");

    callAPI(API_URL + "/pratica", "POST", function (status, response) {
        btnEl.disabled = false;
        btnEl.textContent = "Registrar Prática";

        if (status === 201 && response) {
            mostrarMensagem(msgEl, "✅ " + response.message, "sucesso");
            limparFormularioCadastro();
            carregarEstatisticas();
            buscarHistorico();
        } else if (status === 400 && response) {
            var erros = Array.isArray(response.message) ? response.message.join(", ") : response.message;
            mostrarMensagem(msgEl, "❌ Erro: " + erros, "erro");
        } else if (status === 0) {
            mostrarMensagem(msgEl, "❌ Não foi possível conectar à API. Verifique se o servidor está rodando.", "erro");
        } else {
            mostrarMensagem(msgEl, "❌ Erro inesperado (status " + status + ").", "erro");
        }
    }, payload);
}

function limparFormularioCadastro() {
    document.getElementById("nomeUsuario").value = "";
    document.getElementById("tipo").value = "";
    document.getElementById("data").value = "";
    document.getElementById("descricao").value = "";
    document.getElementById("msg-cadastro").className = "mensagem";
    document.getElementById("msg-cadastro").textContent = "";
}

// ── Histórico ─────────────────────────────────────────────────────────────────
function buscarHistorico() {
    var container = document.getElementById("historico-container");
    container.innerHTML = "<p class='loading'>Carregando histórico...</p>";

    var params = new URLSearchParams();
    var usuario     = document.getElementById("filtro-usuario").value.trim();
    var tipo        = document.getElementById("filtro-tipo").value.trim();
    var dataInicial = document.getElementById("filtro-data-inicial").value;
    var dataFinal   = document.getElementById("filtro-data-final").value;

    if (usuario)     params.append("nomeUsuario", usuario);
    if (tipo)        params.append("tipo", tipo);
    if (dataInicial) params.append("dataInicial", dataInicial);
    if (dataFinal)   params.append("dataFinal", dataFinal);

    var url = API_URL + "/historico";
    if (params.toString()) url += "?" + params.toString();

    callAPI(url, "GET", function (status, response) {
        if (status === 200 && response) {
            if (response.total === 0) {
                container.innerHTML = "<p class='vazio'>Nenhuma prática encontrada com os filtros aplicados.</p>";
                return;
            }
            var html = "<p class='total-resultado'>Exibindo <strong>" + response.total + "</strong> prática(s)</p>";
            html += "<div id='content'>";
            response.data.forEach(function (pratica) {
                html += criarCard(pratica);
            });
            html += "</div>";
            container.innerHTML = html;
        } else if (status === 0) {
            container.innerHTML = "<p class='erro'>Não foi possível conectar à API. Verifique se o servidor está rodando.</p>";
        } else {
            container.innerHTML = "<p class='erro'>Erro ao carregar histórico (status " + status + ").</p>";
        }
    });
}

function criarCard(pratica) {
    var dataFormatada = pratica.data ? pratica.data.substring(0, 10) : "—";
    var html = "<article>";
    html += "<h3>" + escapeHTML(pratica.tipo) + "</h3>";
    html += "<p class='card-usuario'>👤 " + escapeHTML(pratica.nomeUsuario) + "</p>";
    html += "<p class='card-data'>📅 " + dataFormatada + "</p>";
    if (pratica.descricao) {
        html += "<p class='card-descricao'>" + escapeHTML(pratica.descricao) + "</p>";
    }
    html += "</article>";
    return html;
}

function limparFiltros() {
    document.getElementById("filtro-usuario").value = "";
    document.getElementById("filtro-tipo").value = "";
    document.getElementById("filtro-data-inicial").value = "";
    document.getElementById("filtro-data-final").value = "";
    buscarHistorico();
}

// ── Utilitários ───────────────────────────────────────────────────────────────
function mostrarMensagem(el, texto, tipo) {
    el.textContent = texto;
    el.className = "mensagem " + tipo;
}

function escapeHTML(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}