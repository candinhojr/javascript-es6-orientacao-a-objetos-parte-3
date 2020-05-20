let campos = [
    document.querySelector("#data"),
    document.querySelector("#quantidade"),
    document.querySelector("#valor")
];

let [data, quantidade, valor] = campos;

let tbody = document.querySelector("table tbody");

document.querySelector(".form").addEventListener("submit", function(event){
    event.preventDefault();

    let tr = document.createElement("tr");
    
    campos.forEach(campo => {
        let td = document.createElement("td");
        td.textContent = campo.value;
        tr.appendChild(td);
    });

    let tdVolume = document.createElement("td");
    tdVolume.textContent = quantidade.value * valor.value;
    
    tr.appendChild(tdVolume);

    tbody.appendChild(tr);
    this.reset();
    data.focus();
});