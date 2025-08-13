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
    const taskPriority = document.querySelector('#taskPriority').value;
    // verificao de valores válidos
    if (taskName == '' || taskDate == '' || taskTime == '' || taskPriority == '') {
        const toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
        toast.fire({
            title: 'Preencha os campos obrigatórios',
            icon: 'error',
            })
        return;
    }

    // Criando um objeto com os valores recuperados
    const novaTarefa = {
        'taskName': taskName,
        'taskDescription': taskDescription,
        'taskDate': taskDate,
        'taskTime': taskTime,
        'taskPriority': taskPriority,
        'concluida': false
    };

    // Adicionando o objeto a lista global
    globalThis.tarefas.push(novaTarefa);
    localStorage.setItem('tarefas', JSON.stringify(globalThis.tarefas)); // armazenando local
    ordenarTarefas('recentes');
    exibirValores();
    document.querySelector('#taskForm').reset();
    // eventos de botoes
    const toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
    });
    toast.fire({
        icon: 'success',
        title: 'Tarefa adicionada.'   
    })
})

const exibirValores = () => {
    analiseData();
    const containerTasks = document.querySelector('.task-list');
    containerTasks.innerHTML = '';
    globalThis.tarefas.forEach((task, index) => {
        const taskHTML = document.createElement('div');
        if (task.atrasada){
            taskHTML.classList.add('atrasada');
        }
        if (task.concluida) {
            task.atrasda = false;
            taskHTML.classList.remove('atrasada');
            taskHTML.classList.add('concluida');
        }
        taskHTML.classList.add(task.taskPriority)
        taskHTML.classList.add('task-item');
        taskHTML.innerHTML += `
            <h3>${task.taskName}</h3>
            <p>${task.taskDescription}</p>
            <p><strong>Vencimento:</strong> ${task.taskDate} às ${task.taskTime}</p>
            <p> Prioridade: ${task.taskPriority}</p>
            <div class="task-actions">
                <button class="complete-btn" ${task.concluida ? 'disabled' : ''}>Concluir</button>
                <button class="edit-btn" ${task.concluida ? 'disabled' : ''}>Editar</button>
                <button class="delete-btn" ${task.concluida ? 'disabled' : ''}>Excluir</button>
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

    // desativa os botões DENTRO do elemento da tarefa
    taskHTML.querySelector('.edit-btn').disabled = true;
    taskHTML.querySelector('.delete-btn').disabled = true;
}

const excluirTarefa = (index) => {
    Swal.fire({
        background: "#393e46",
        title: "Você tem certeza?",
        text: "Você poderá acessar na aba de excluídos",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim, confirmar!",
        color: '#fff',
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                background: "#393e46",
                title: "Excluído!",
                text: "Seu arquivo está na lixeira.",
                icon: "success",
                color: '#fff',
            });
            // Armazenando a tarefa exluida na lista das deletadas
            globalThis.tarefasExcluidas.push(globalThis.tarefas[index]);
            localStorage.setItem('tarefasExcluidas', JSON.stringify(globalThis.tarefasExcluidas));

            globalThis.tarefas.splice(index, 1);
            localStorage.setItem('tarefas', JSON.stringify(globalThis.tarefas));
            exibirValores();
            const toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
            });
            toast.fire({
                icon: 'success',
                title: 'Tarefa excluída'   
            })
        }
        else if(!result.isConfirmed){
            Swal.fire({
                background: "#393e46",
                title: "Tarefa mantida.",
                text: "Sua tarefa não foi excluida",
                icon: "error",
                color: '#fff',
            });
        }
    });
}

const editarTarefa = (index) => {
    // Valores do prompt para adicionar a nova task
    Swal.fire({
        background: "#393e46",
        color: '#fff',
        title: "<h3 class='removed-title'>Editar tarefa</h3>",
        html: `
        <div class="task-form">
            <form id="taskForm">
                <label for="taskName">Nome da Tarefa:</label>
                <input type="text" id="newTaskName" required>

                <label for="taskDescription">Descrição:</label>
                <textarea id="newTaskDescription" rows="3"></textarea>

                <label for="taskDate">Data de Vencimento:</label>
                <input type="date" id="newTaskDate" required>

                <label for="taskTime">Hora de Vencimento:</label>
                <input type="time" id="newTaskTime" required>

                <label for="taskTime">Prioridade</label>
                <select name="newTaskPriority" id="newTaskPriority">
                    <option value=""></option>
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                </select>
            </form>
        </div>
        `,
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
    }).then((result) => { // Caso seja confirmado atualizar a Task
        if(result.isConfirmed){
            // Pegando os valores do formulario
            const newTaskName = document.querySelector('#newTaskName').value;
            const newTaskDescription = document.querySelector('#newTaskDescription').value;
            const newTaskDate = document.querySelector('#newTaskDate').value;
            const newTaskTime = document.querySelector('#newTaskTime').value;
            const newTaskPriority = document.querySelector('#newTaskPriority').value;
            // Guardando tudo dentro de um Objeto
            const newTask = {
                'taskName':newTaskName,
                'taskDescription':newTaskDescription,
                'taskDate':newTaskDate,
                'taskTime':newTaskTime,
                'taskPriority':newTaskPriority,
                'concluida':false
            };

            // Adicionando a tarefa atualizada no Objeto e local Storage
            globalThis.tarefas[index] = newTask;
            localStorage.setItem('tarefas', JSON.stringify(globalThis.tarefas));
            exibirValores();
            const toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
            });
            toast.fire({
                icon: 'success',
                title: 'Tarefa editada.'   
            })
        }
        else{
            Swal.fire({
                title: 'Campos inválidos',
                text: 'Nenhuma tarefa atualizada',
                icon: 'error'
            })
        }
    });
    
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
    // Obtendo a diferença entre as datas em MS e organizando elas
    if (ordem == 'recentes'){
        const toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
        });
        toast.fire({
            icon: 'success',
            title: 'Ordenado por mais recentes'   
        })
        globalThis.tarefas.sort((taskA, taskB) => new Date(`${taskA.taskDate}:${taskA.taskTime}`) - new Date(`${taskB.taskDate}:${taskB.taskTime}`));
    } 
    if (ordem == 'antigas'){
        const toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
        });
        toast.fire({
            icon: 'success',
            title: 'Ordenado por mais antigas'   
        })
        globalThis.tarefas.sort((taskA, taskB) => new Date(`${taskB.taskDate}:${taskB.taskTime}`) - new Date(`${taskA.taskDate}:${taskA.taskTime}`));
    } 
    localStorage['tarefas'] = JSON.stringify(globalThis.tarefas);
    exibirValores();
}

document.querySelector("#exibirLixeiraBtn").addEventListener('click', () => {
    const tarefas = JSON.parse(localStorage.getItem('tarefasExcluidas')) || [];
    let taskHTML = '';

    tarefas.forEach((task, index) => {
        taskHTML += `
        <div class="task-item" data-index="${index}">
            <h3>${task.taskName}</h3>
            <p>${task.taskDescription}</p>
            <p><strong>Vencimento:</strong> ${task.taskDate} às ${task.taskTime}</p>
            <div class="task-actions">
                <button class="delete-btn">Excluir</button>
                <button class="restaurar-btn">Restaurar</button>
            </div>
        </div>
        `;
    });
    if (tarefas.length==0){
        const toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
        toast.fire({
            icon: 'error',
            title: 'Nenhuma tarefa na lixeira'   
        })
    }
    else{
        Swal.fire({
            background: "#393e46",
            color: '#fff',
            title: "Tarefas Excluídas",
            html: taskHTML,
            confirmButtonText: "Cancelar",
            didOpen: () => {
                document.querySelectorAll('.restaurar-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        Swal.fire({
                            background: "#393e46",
                            color: 'white',
                            title: 'Confirmar restauração?',
                            text: 'Se restaurada, ela voltará as tarefas ativas',
                            icon: 'question',
                            showConfirmButton: true,
                            showCancelButton: true,
                        }).then((result) =>{
                            if(result.isConfirmed){
                                Swal.fire({
                                    background: "#393e46",
                                    color: 'white',
                                    title: 'Restauração concluída',
                                    text: 'Sua tarefa foi restaurada',
                                    icon: 'success'
                                })
                                const index = e.target.closest('.task-item').dataset.index; // Pega o indice da tarefa inserido no HTML
                                const tarefaRestaurada = globalThis.tarefasExcluidas.splice(index, 1)[0]; // Remove da lixeira
                                tarefaRestaurada.concluida = false;
                                globalThis.tarefas.push(tarefaRestaurada);
                                localStorage.setItem('tarefas', JSON.stringify(globalThis.tarefas));
                                localStorage.setItem('tarefasExcluidas', JSON.stringify(globalThis.tarefasExcluidas));
                                ordenarTarefas('recentes');
                                exibirValores();
                            }
                            else if(!result.isConfirmed){
                                Swal.fire({
                                    background: "#393e46",
                                    color: 'white',
                                    title: 'Restauração falha',
                                    text: 'Sua tarefa não foi restaurada',
                                    icon: 'error'
                                })
                            }
                        })
                    });
                });
                document.querySelectorAll('.delete-btn').forEach(btn=>{
                    btn.addEventListener('click', (e) =>{
                        const index = e.target.closest('.task-item').dataset.index;
                        Swal.fire({
                            background: "#393e46",
                            color: 'white',
                            title: 'Confirmar Exclusão?',
                            text: 'Uma vez confirmada, essa ação será irreversível',
                            icon: 'question',
                            showCancelButton: true,
                            cancelButtonColor: 'red',
                        }).then((result) =>{
                            if(result.isConfirmed){
                                Swal.fire({
                                    background: "#393e46",
                                    color: 'white',
                                    title: 'Tarefa excluída.',
                                    text: 'Sua tarefa foi excluída!',
                                    icon: 'success'
                                })
                                globalThis.tarefasExcluidas.splice(index, 1)[0];
                                localStorage.setItem('tarefasExcluidas', JSON.stringify(globalThis.tarefasExcluidas));
                            }
                            else if(!result.isConfirmed){
                                Swal.fire({
                                    background: "#393e46",
                                    color: 'white',
                                    title: 'Tarefa mantida.',
                                    text: 'Sua tarefa não foi excluida',
                                    icon: 'error'
                                })
                                return;
                            }
                        })
                    })
                })
            }
        });
    }
});

const analiseData = () =>{
    const tarefas = JSON.parse(localStorage.getItem('tarefas'));
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0];
    tarefas.forEach((task, index) =>{
        dateTask = task.taskDate;
        if (dateTask < dataFormatada){
            tarefas[index].atrasada = true;
        }
        else if(dateTask > dataFormatada){
            tarefas[index].atrasada = false;
        }
    })
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
}