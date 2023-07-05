let textBox = document.getElementById("todoText");
let submitEl = document.getElementById("submit");
let tasksEl = document.getElementById("tasksEl");
let allButton = document.getElementById("allButton");
let completedButton = document.getElementById("completedButton")
let pendingButton = document.getElementById("pendingButton")
let dropdownMenuButton = document.getElementById("dropdownMenuButton")
let logoutButton = document.getElementById("logoutButton");
let clearBtn = document.getElementById("clearBtn");
let textMessage = document.getElementById("textMessage");


clearBtn.addEventListener("click", ()=>{
    fetch("/deleteTodos")
    tasksEl.textContent = "";
    textMessage.textContent = "No Tasks!"
})

logoutButton.addEventListener("click", async ()=>{
    const a = await fetch("/logout")
    window.location.href = "/"
})

function addFunctionalityDb(todoId, description, completeValue){
    textMessage.textContent = "";
    let taskContainer = document.createElement("div");
    const headingContainer = document.createElement("div");
    let inputBox = document.createElement("input");
    let headingEl = document.createElement("h1");
    let coulmnContainer = document.createElement("div");
    let deleteIconContainer = document.createElement("button");
    let editIconContainer = document.createElement("button");
    let deleteIcon = document.createElement("i");
    let editIcon = document.createElement("i");
    headingEl.id = "heading" + todoId
    inputBox.type = "checkbox";

    if(completeValue === "true"){
        inputBox.checked = true
        headingContainer.classList.add("strikeThrough");
    }else{
        
    }
    headingEl.textContent = description
    function changeHeading(){
        const ele = headingContainer.firstElementChild;
        const inputEl = document.createElement("input");
        ele.parentNode.replaceChild(inputEl, ele);
        inputEl.value = ele.textContent;
        inputEl.focus()
        inputEl.addEventListener("blur", async()=>{
            const createEl = document.createElement("h1");
            createEl.textContent = inputEl.value;
            if(createEl.textContent === ""){
                createEl.textContent = ele.textContent
                inputEl.parentNode.replaceChild(createEl, inputEl);
                createEl.classList.add("taskHeading")
            }else if(ele.textContent === inputEl.textContent){
                createEl.textContent = ele.textContent
                inputEl.parentNode.replaceChild(createEl, inputEl);
                createEl.classList.add("taskHeading")
            }else{
                inputEl.parentNode.replaceChild(createEl, inputEl);
                createEl.classList.add("taskHeading")
                //sendPutRequestToChangeTheDescription
                try{
                    const dataBod = {
                        "todoid": todoId,
                        "description": createEl.textContent
                    }
                    const options = {
                        method:"PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body:JSON.stringify(dataBod)
                    }
                    const fetchData = await fetch("/editData", options)

                }catch(error){
                    
                }
            }
            

        })
    }

    editIconContainer.addEventListener("click", ()=>{
        if(!inputBox.checked){
            changeHeading()
        }
    })

    headingContainer.addEventListener("click", ()=>{
        if(!inputBox.checked){
            changeHeading()
        }
        
    })
    taskContainer.id = "task" + todoId
    taskContainer.classList.add("taskContainer");
    inputBox.classList.add("boxStyling");
    headingEl.classList.add("taskHeading");
    coulmnContainer.classList.add("columnCenter");
    deleteIcon.classList.add("fa-solid", "fa-trash-can", "iconStyling");
    editIcon.classList.add("fa-solid", "fa-pencil", "iconStyling");
    deleteIconContainer.classList.add("buttS")
    editIconContainer.classList.add("buttS")
    deleteIcon.id = todoId;
    deleteIconContainer.appendChild(deleteIcon);
    
    deleteIconContainer.addEventListener("click", async (event)=>{
        let id = "task" + todoId
        let taskContainer = document.getElementById(id)
        taskContainer.remove();
        let bodyData = {
            "todolistId": todoId
        }
        let options = {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyData)
        }
        try{
            const result = await fetch("/delete", options)
        }catch(error){

        }
    })
    

    inputBox.addEventListener("change", async()=>{
        if(inputBox.checked){
            headingContainer.classList.add("strikeThrough");
        }else{
            headingContainer.classList.remove("strikeThrough");
            
        }
        let bodyData = {
            "todoid": todoId,
            "iscompleted": inputBox.checked
        }
        let options = {
            method: "PUT",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyData)
        }
        const fetchdata = await fetch("/changeStatus", options)

    })
    headingContainer.classList.add("headingCon")
    editIconContainer.appendChild(editIcon);

    coulmnContainer.appendChild(deleteIconContainer);
    coulmnContainer.appendChild(editIconContainer);

    taskContainer.appendChild(inputBox);
    headingContainer.appendChild(headingEl)
    taskContainer.appendChild(headingContainer);
    taskContainer.appendChild(coulmnContainer);

    tasksEl.appendChild(taskContainer);
    headingEl.textContent = description
    
}

allButton.addEventListener("click", async()=>{
    pendingButton.classList.remove("active")
    completedButton.classList.remove("active")
    allButton.classList.add("active");
    dropdownMenuButton.textContent = "All";
    tasksEl.textContent = "";
    try{
        const arr = await fetch("/allDetails");
        const res = await arr.json()
        if(res.length === 0){
            textMessage.textContent = "No Tasks!"
        }
        for (let i of res){
            addFunctionalityDb(i.todoid, i.description, i.iscompleted)
        }
    }catch(error){
        console.log(error)
    }
})

completedButton.addEventListener("click", async()=>{
    pendingButton.classList.remove("active")
    allButton.classList.remove("active")
    completedButton.classList.add("active");
    dropdownMenuButton.textContent = "Completed";
    tasksEl.textContent = "";
    try{
        const arr = await fetch("/completedDetails");
        const res = await arr.json()
        if(res.length === 0){
            textMessage.textContent = "No tasks have been completed"
        }
        for (let i of res){
            addFunctionalityDb(i.todoid, i.description, i.iscompleted)
        }
    }catch(error){

    }

})

pendingButton.addEventListener("click", async()=>{
    completedButton.classList.remove("active")
    allButton.classList.remove("active")
    pendingButton.classList.add("active");
    dropdownMenuButton.textContent = "Pending"
    tasksEl.textContent = "";
    try{
        const arr = await fetch("/pendingDetails");
        const res = await arr.json()
        if(res.length === 0){
            textMessage.textContent = "No Pending Tasks"
        }
        for (let i of res){
            addFunctionalityDb(i.todoid, i.description, i.iscompleted)
        }
    }catch(error){

    }
})



async function sendData(){
    try{
        const res = await fetch("/data")
        if(res.ok){
            const data = await res.json()
            if(data.length === 0){
                textMessage.textContent = "No tasks!"
            }
            for (let i of data){
                let todoId = i.todoid
                let description = i.description
                let comple = i.iscompleted
                addFunctionalityDb(todoId, description, comple)
            }
        }
    }catch(e){
        console.log(e)
    }
}

sendData();

async function sendingPostRequest(text, completedValue){
    let dataBody = {
        'description': text,
        'isCompleted': completedValue
    }
    let options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataBody)
    }  

    try{
        const res = await fetch("/sendData", options)
        const resObject = await res.json()
        addFunctionalityDb(resObject.todoId, resObject.description, resObject.iscompleted)

    }catch(e){

    }
}

function addFunctionality(tasksEl, textBox, completedValue) {

    sendingPostRequest(textBox.value, completedValue)
}

submitEl.addEventListener("click", (event) => {
    if (textBox.value === "") {

    } else {
        const completedValue = "false"
        addFunctionality(tasksEl, textBox, completedValue)
        textBox.value = ""
    }
})

textBox.addEventListener("focus", ()=>{
    document.addEventListener("keydown", handleKeyPress)
})

function handleKeyPress(event) {
    if (event.key === "Enter") {
        if(event.key === "Enter" && textBox.value !== ""){
            const completedValue = "false"
            addFunctionality(tasksEl, textBox, completedValue)
            textBox.value = ""
        }
    }
  }

textBox.addEventListener("blur", ()=>{
    document.removeEventListener("keydown", handleKeyPress);
})
