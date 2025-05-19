globalThis.tarefasExcluidas = [];
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Armazenando os possiveis valores
        const tarefasArmazenadas = localStorage.getItem('tarefas');
        // Verificando se existem
        if (!tarefasArmazenadas) {
            console.log('Nenhuma tarefa');
            globalThis.tarefas = []; // Caso nao criar uma nova array
        }
        else {
            // se existir alterar os valores da variavel global
            const dados = JSON.parse(tarefasArmazenadas);
            globalThis.tarefas = Array.isArray(dados) ? dados : [];
        }
    }
    catch (erro) {
        console.error('Erro ao carregar tarefas:', erro);
        globalThis.tarefas = [];
    }
    exibirValores();
})

document.querySelector('#adicionarTarefaBtn').addEventListener('click', () => {
    // Valores do HTML para adicionar a nova task
    const taskName = document.querySelector('#taskName').value;
    const taskDescription = document.querySelector('#taskDescription').value;
    const taskDate = document.querySelector('#taskDate').value;
    const taskTime = document.querySelector('#taskTime').value;
    // verificao de valores válidos
    if (taskName == '' || taskDate == '' || taskTime == '') {
        alert('Insira valores válidos');
        return;
    }

    // Criando um objeto com os valores recuperados
    const novaTarefa = {
        'taskName': taskName,
        'taskDescription': taskDescription,
        'taskDate': taskDate,
        'taskTime': taskTime
    };

    // Adicionando o objeto a lista global
    globalThis.tarefas.push(novaTarefa);
    localStorage.setItem('tarefas', JSON.stringify(globalThis.tarefas)); // armazenando local
    exibirValores();
    // eventos de botoes

})

const exibirValores = () => {
    const containerTasks = document.querySelector('.task-list');
    containerTasks.innerHTML = '';
    globalThis.tarefas.forEach((task, index) => {
        const taskHTML = document.createElement('div');
        if (task.concluida) {
            taskHTML.classList.add('concluida');
        }
        taskHTML.classList.add('task-item');
        taskHTML.innerHTML += `
        <h3>${task.taskName}</h3>
        <p>${task.taskDescription}</p>
        <p><strong>Vencimento:</strong> ${task.taskDate} às ${task.taskTime}</p>
        <div class="task-actions">
            <button class="complete-btn">Concluir</button>
            <button class="edit-btn">Editar</button>
            <button class="delete-btn">Excluir</button>
        </div>
        `
        containerTasks.appendChild(taskHTML);
        taskHTML.querySelector('.complete-btn').addEventListener('click', function () {
            marcarComoConcluida(taskHTML, index);
        });
        taskHTML.querySelector('.edit-btn').addEventListener('click', () => editarTarefa(index));
        taskHTML.querySelector('.delete-btn').addEventListener('click', () => excluirTarefa(index));
    })
}

const marcarComoConcluida = (taskHTML, index) => {
    globalThis.tarefas[index].concluida = true;
    localStorage.setItem('tarefas', JSON.stringify(globalThis.tarefas)); // salva no localStorage
    exibirValores(); // recarrega a lista pra mostrar a mudança
}

const excluirTarefa = (index) => {
    // Armazenando a tarefa exluida na lista das deletadas
    globalThis.tarefasExcluidas.push(globalThis.tarefas[index]);
    localStorage.setItem('tarefasExcluidas', JSON.stringify(globalThis.tarefasExcluidas));
    
    globalThis.tarefas.splice(index, 1);
    localStorage.setItem('tarefas', JSON.stringify(globalThis.tarefas));
    exibirValores();
}

const editarTarefa = (index) => {
    // Valores do prompt para adicionar a nova task
    globalThis.tarefas[index].taskName = prompt('Novo título: ');
    globalThis.tarefas[index].taskDescription = prompt('Nova descrição: ');
    exibirValores();
}

const filtrarTarefas = (classe) => {
    const containerTasks = document.querySelector('.task-list');
    containerTasks.innerHTML = '';
    let tarefasFiltradas = [];
    switch (classe) {
        case 'todas':
            tarefasFiltradas = globalThis.tarefas;
            break
        case 'concluidas':
            tarefasFiltradas = globalThis.tarefas.filter(task => task.concluida);
            break;
        case 'pendentes':
            tarefasFiltradas = globalThis.tarefas.filter(task => !task.concluida);
            break;
    }

    tarefasFiltradas.forEach(task => {
        const taskHTML = document.createElement('div');
        if (task.concluida) {
            taskHTML.classList.add('concluida');
        }
        taskHTML.classList.add('task-item');
        taskHTML.innerHTML += `
        <h3>${task.taskName}</h3>
        <p>${task.taskDescription}</p>
        <p><strong>Vencimento:</strong> ${task.taskDate} às ${task.taskTime}</p>
        <div class="task-actions">
            <button class="complete-btn">Concluir</button>
            <button class="edit-btn">Editar</button>
            <button class="delete-btn">Excluir</button>
        </div>
        `
        containerTasks.appendChild(taskHTML);
    })

}

window.onload = () => {
    // Adicionando event listeners para os botões
    // Event listeners para os botões de filtro
    document.querySelector('#filtrarTodasBtn').addEventListener('click', function () {
        filtrarTarefas('todas');
    });

    document.querySelector('#filtrarPendentesBtn').addEventListener('click', function () {
        filtrarTarefas('pendentes');
    });

    document.querySelector('#filtrarConcluidasBtn').addEventListener('click', function () {
        filtrarTarefas('concluidas');
    });

    // Event listeners para os botões de ordenação
    document.querySelector('#ordenarRecentesBtn').addEventListener('click', function () {
        ordenarTarefas('recentes');
    });

    document.querySelector('#ordenarAntigasBtn').addEventListener('click', function () {
        ordenarTarefas('antigas');
    });
}

const ordenarTarefas = (ordem) => {
    if (ordem == 'recentes') globalThis.tarefas.sort((taskA, taskB) => new Date(`${taskA.taskDate}:${taskA.taskTime}`) - new Date(`${taskB.taskDate}:${taskB.taskTime}`));
    if (ordem == 'antigas') globalThis.tarefas.sort((taskA, taskB) => new Date(`${taskB.taskDate}:${taskB.taskTime}`) - new Date(`${taskA.taskDate}:${taskA.taskTime}`));
    localStorage['tarefas'] = JSON.stringify(globalThis.tarefas);
    exibirValores();
}

document.querySelector("#exibirLixeiraBtn").addEventListener('click', ()=>{
    console.log(JSON.parse(localStorage.getItem('tarefasExcluidas')));
})