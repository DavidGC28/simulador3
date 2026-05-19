
let clientes = [];
let creditos = []; 
let tasaInteresGlobal = 15;
let clienteSeleccionado = null;
let clienteSeleccionadoVip = null;

document.addEventListener("DOMContentLoaded", function() {
   
    const inputMontoEstandar = document.getElementById("montoCredito");
    if (inputMontoEstandar) {
        inputMontoEstandar.addEventListener("input", function() {
            const montoIngresado = parseFloat(this.value);
            if (montoIngresado > 5000) {
                alert("Para montos mayores a $5,000, por favor utiliza la sección de Crédito VIP. El campo se vaciará.");
                this.value = "";
            }
        });
    }
    const inputMontoVip = document.getElementById("montoCreditoVip");
    if (inputMontoVip) {
        inputMontoVip.addEventListener("blur", function() {
            const montoIngresado = parseFloat(this.value);
            if (!isNaN(montoIngresado) && montoIngresado < 5000) {
                alert("Los créditos VIP requieren un monto mínimo de $5,000. El campo se vaciará.");
                this.value = "";
            }
        });
    }
});


function ocultarSecciones() {
    let secciones = document.querySelectorAll("section");
    secciones.forEach(sec => {
        sec.classList.remove("activa");
    });
}

function mostrarSeccion(id) {
    ocultarSecciones();
    let seccion = document.getElementById(id);
    if (seccion) {
        seccion.classList.add("activa");
    }
}


function guardarTasa() {
    let valor = recuperarFloat("tasaInteres");
    if (valor >= 10 && valor <= 20) {
        tasaInteresGlobal = valor;
        mostrarTexto("mensajeTasa", "Tasa configurada correctamente: " + valor + "%");
        document.getElementById("mensajeTasa").style.color = "green";
    } else {
        mostrarTexto("mensajeTasa", "La tasa debe estar entre 10% y 20%");
        document.getElementById("mensajeTasa").style.color = "red";
    }
}

function guardarLimite() {
    const valor = recuperarFloat("montoMaximo");
    if (!isNaN(valor) && valor > 0) {
        limiteCreditoMaximo = valor;
        mostrarTexto("mensajeTasa", `Límite de crédito actualizado a: $${limiteCreditoMaximo}`);
        document.getElementById("mensajeTasa").style.color = "green";
    } else {
        mostrarTexto("mensajeTasa", "Por favor, ingrese un límite válido superior a 0.");
        document.getElementById("mensajeTasa").style.color = "red";
    }
}


function buscarCliente(cedula) {
    for (let i = 0; i < clientes.length; i++) {
        if (clientes[i].cedula === cedula) return clientes[i];
    }
    return null;
}

function guardarCliente() {
    let ced = recuperaraTexto("cedula");
    let nom = recuperaraTexto("nombre");
    let ape = recuperaraTexto("apellido");
    let ing = recuperarFloat("ingresos");
    let egr = recuperarFloat("egresos");

    if (!ced || !nom || !ape) {
        alert("Por favor, llene los campos obligatorios (Cédula, Nombre, Apellido).");
        return;
    }

    let existente = buscarCliente(ced);
    if (existente == null) {
        clientes.push({ cedula: ced, nombre: nom, apellido: ape, ingresos: ing, egresos: egr });
    } else {
        existente.nombre = nom; 
        existente.apellido = ape;
        existente.ingresos = ing; 
        existente.egresos = egr;
    }
    pintarClientes();
    limpiar();
}

function pintarClientes() {
    let tabla = document.getElementById("tablaClientes");
    tabla.innerHTML = ""; 
    clientes.forEach(c => {
        let fila = `<tr>
            <td>${c.cedula}</td><td>${c.nombre}</td><td>${c.apellido}</td>
            <td>$${c.ingresos.toFixed(2)}</td><td>$${c.egresos.toFixed(2)}</td>
            <td><button class="btn btn-secundario" onclick="seleccionarCliente('${c.cedula}')">Actualizar</button></td>
        </tr>`;
        tabla.innerHTML += fila;
    });
}

function seleccionarCliente(cedula) {
    let c = buscarCliente(cedula);
    if (c) {
        mostrarTextoEnCaja("cedula", c.cedula);
        mostrarTextoEnCaja("nombre", c.nombre);
        mostrarTextoEnCaja("apellido", c.apellido);
        mostrarTextoEnCaja("ingresos", c.ingresos);
        mostrarTextoEnCaja("egresos", c.egresos);
    }
}

function limpiar() {
    mostrarTextoEnCaja("cedula", ""); 
    mostrarTextoEnCaja("nombre", "");
    mostrarTextoEnCaja("apellido", ""); 
    mostrarTextoEnCaja("ingresos", "");
    mostrarTextoEnCaja("egresos", "");
    clienteSeleccionado = null;
}


function buscarClienteCredito() {
    let ced = recuperaraTexto("buscarCedulaCredito");
    let cliente = buscarCliente(ced);
    let contenedor = document.getElementById("datosClienteCredito");

    if (cliente) {
        clienteSeleccionado = cliente;
        contenedor.innerHTML = `
            <h3>Datos del Cliente</h3>
            <p><strong>Cédula:</strong> ${cliente.cedula}</p>
            <p><strong>Nombre:</strong> ${cliente.nombre} ${cliente.apellido}</p>
            <p><strong>Ingresos:</strong> $${cliente.ingresos}</p>
            <p><strong>Egresos:</strong> $${cliente.egresos}</p>`;
    } else {
        clienteSeleccionado = null;
        contenedor.innerHTML = "<p style='color:red;'>Cliente no encontrado</p>";
    }
}

function calcularCredito() {
    if (!clienteSeleccionado) {
        alert("Primero busque un cliente.");
        return;
    }

    let monto = recuperarFloat("montoCredito");
    let plazo = recuperarInt("plazoCredito");
    let resultadoDiv = document.getElementById("resultadoCredito");

    if (isNaN(monto) || monto > 5000 || monto <= 0) {
        alert("El monto máximo permitido en esta sección es de $5,000.");
        mostrarTextoEnCaja("montoCredito", "");
        document.getElementById("btnSolicitarCredito").disabled = true;
        return;
    }

    if (isNaN(plazo) || plazo <= 0) {
        alert("Ingrese un plazo válido.");
        return;
    }

    let capacidadPago = (clienteSeleccionado.ingresos - clienteSeleccionado.egresos) * 0.4;
    let totalPagar = monto + (monto * (tasaInteresGlobal / 100));
    let cuotaMensual = totalPagar / plazo;

    let aprobado = cuotaMensual <= capacidadPago;

    resultadoDiv.className = aprobado ? "resultado-simulacion aprobado" : "resultado-simulacion rechazado";
    resultadoDiv.innerHTML = `
        Capacidad de pago: $${capacidadPago.toFixed(2)}<br>
        Total a pagar: $${totalPagar.toFixed(2)}<br>
        Cuota mensual: $${cuotaMensual.toFixed(2)}<br>
        RESULTADO: <span style="font-weight:bold; color:${aprobado ? 'green' : 'red'}">${aprobado ? "APROBADO" : "RECHAZADO"}</span>`;

    document.getElementById("btnSolicitarCredito").disabled = !aprobado;
}

function solicitarCredito() {
    let montoCalculado = recuperarFloat("montoCredito");
    let plazoIngresado = recuperarInt("plazoCredito");
    let totalPagar = montoCalculado + (montoCalculado * (tasaInteresGlobal / 100));
    let cuotaCalculada = (totalPagar / plazoIngresado).toFixed(2);

    let credito = {
        cedula: clienteSeleccionado.cedula,
        nombre: clienteSeleccionado.nombre,
        apellido: clienteSeleccionado.apellido,
        monto: montoCalculado,
        tasa: tasaInteresGlobal,
        plazo: plazoIngresado,
        cuota: cuotaCalculada
    };

    creditos.push(credito);
    alert("Crédito asignado correctamente");
    
    mostrarTextoEnCaja("montoCredito", "");
    mostrarTextoEnCaja("plazoCredito", "");
    mostrarTextoEnCaja("buscarCedulaCredito", "");
    document.getElementById("datosClienteCredito").innerHTML = '<p class="texto-vacio">No se ha seleccionado ningún cliente.</p>';
    document.getElementById("btnSolicitarCredito").disabled = true;
    document.getElementById("resultadoCredito").innerHTML = "";

    pintarCreditos(creditos);
    mostrarSeccion("listaCreditos");
}

function buscarClienteVip() {
    const cedula = recuperaraTexto("buscarCedulaVip");
    const cliente = buscarCliente(cedula); 
    const panel = document.getElementById("datosClienteVip");

    if (cliente) {
        clienteSeleccionadoVip = cliente;
        panel.innerHTML = `<p><strong>Cliente:</strong> ${cliente.nombre} ${cliente.apellido} | <strong>Ingresos:</strong> $${cliente.ingresos}</p>`;
    } else {
        clienteSeleccionadoVip = null;
        panel.innerHTML = `<p class="texto-vacio" style="color:red;">Cliente no encontrado.</p>`;
    }
}

function calcularCreditoVip() {
    if (!clienteSeleccionadoVip) {
        alert("Por favor, busque y seleccione un cliente primero.");
        return;
    }

    const monto = recuperarFloat("montoCreditoVip");
    const plazo = recuperarInt("plazoCreditoVip");

    if (isNaN(monto) || monto < 5000) {
        alert("El monto mínimo para un crédito VIP es de $5,000.");
        mostrarTextoEnCaja("montoCreditoVip", "");
        document.getElementById("btnSolicitarCreditoVip").disabled = true;
        return;
    }

    if (monto > limiteCreditoMaximo) {
        alert(`El monto supera el límite máximo del sistema configurado en $${limiteCreditoMaximo}.`);
        mostrarTextoEnCaja("montoCreditoVip", "");
        document.getElementById("btnSolicitarCreditoVip").disabled = true;
        return;
    }

    if (isNaN(plazo) || plazo <= 0) {
        alert("Por favor, ingrese un plazo válido en meses.");
        return;
    }

    const capacidadPago = (clienteSeleccionadoVip.ingresos - clienteSeleccionadoVip.egresos) * 0.5; 
    const totalPagar = monto + (monto * ((tasaInteresGlobal - 2) / 100)); 
    const cuotaMensual = totalPagar / plazo;
    const aprobado = cuotaMensual <= capacidadPago;

    const resultado = document.getElementById("resultadoCreditoVip");
    resultado.className = aprobado ? "resultado-simulacion aprobado" : "resultado-simulacion rechazado";
    resultado.innerHTML = `
        <strong>Capacidad de pago VIP:</strong> $${capacidadPago.toFixed(2)}<br>
        <strong>Total a pagar (Tasa VIP ${tasaInteresGlobal - 2}%):</strong> $${totalPagar.toFixed(2)}<br>
        <strong>Cuota mensual:</strong> $${cuotaMensual.toFixed(2)}<br>
        <hr>
        <strong>RESULTADO:</strong> <span style="font-weight: bold; color: ${aprobado ? 'green' : 'red'}">${aprobado ? "APROBADO" : "RECHAZADO"}</span>`;
    
    document.getElementById("btnSolicitarCreditoVip").disabled = !aprobado;
}

function solicitarCreditoVip() {
    const montoCalculado = recuperarFloat("montoCreditoVip");
    const plazoIngresado = recuperarInt("plazoCreditoVip");
    const totalPagar = montoCalculado + (montoCalculado * ((tasaInteresGlobal - 2) / 100));
    const cuotaCalculada = (totalPagar / plazoIngresado).toFixed(2);

    let credito = {
        cedula: clienteSeleccionadoVip.cedula,
        nombre: clienteSeleccionadoVip.nombre,
        apellido: clienteSeleccionadoVip.apellido,
        monto: montoCalculado,
        tasa: tasaInteresGlobal - 2,
        plazo: plazoIngresado,
        cuota: cuotaCalculada
    };

    creditos.push(credito);
    alert("Crédito VIP otorgado con éxito.");
    
    mostrarTextoEnCaja("montoCreditoVip", "");
    mostrarTextoEnCaja("plazoCreditoVip", "");
    mostrarTextoEnCaja("buscarCedulaVip", "");
    
    document.getElementById("datosClienteVip").innerHTML = '<p class="texto-vacio">No se ha seleccionado ningún cliente.</p>';
    document.getElementById("btnSolicitarCreditoVip").disabled = true;
    document.getElementById("resultadoCreditoVip").innerHTML = "";

    pintarCreditos(creditos);
    mostrarSeccion("listaCreditos");
}


function buscarCreditos(cedula) {
    let filtrados = [];
    for (let i = 0; i < creditos.length; i++) {
        if (creditos[i].cedula === cedula) {
            filtrados.push(creditos[i]);
        }
    }
    return filtrados;
}

function pintarCreditos(arregloCreditos) {
    let tabla = document.getElementById("tablaCreditos");
    tabla.innerHTML = ""; 

    arregloCreditos.forEach(cre => {
        let fila = `<tr>
            <td>${cre.cedula}</td>
            <td>${cre.nombre}</td>
            <td>${cre.apellido}</td>
            <td>$${cre.monto}</td>
            <td>${cre.tasa}%</td>
            <td>${cre.plazo} meses</td>
            <td>$${cre.cuota}</td>
        </tr>`;
        tabla.innerHTML += fila;
    });
}

function buscarCreditosCliente() {
    let cedulaCaja = recuperaraTexto("buscarCedulaListado");
    let resultado = buscarCreditos(cedulaCaja);
    pintarCreditos(resultado);
}