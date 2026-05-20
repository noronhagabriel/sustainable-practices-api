const apiUrl = "http://localhost:3001/api/students";

windows.onload = function(){
    readALL();
}


function callAPI(url, method, callback, data){
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    if(method === "POST" || method === "PATCH" || method === "PUT"){
        xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    }
    xhr.onload = function(){
        callback(xhr.status, xhr.response);
    }
    if (data){
        xhr.send(JSON.stringify(data));
    }
    else{
        xhr.send();
    }

    function createCard(student){
        var str = "<article>";
        str += "<h1>" + student.name + "</h1>";
        str += "<p>" + student.tia + "</p>";
        str += "<p>" + student.course + "</p>";
        str += "<button onclick='deleteStudent(" + student.tia + ")'>Delete</button>";
        str += "<button onclick='findStudent(" + student.tia + ")'>Edit</button>";
        str += "</article>";
        return str;
    }
    function readALL(){
        const url = apiUrl;
        callAPI(url, "GET", function(status, response){
            if(status === 200){
                var container = document.getElementById("content");
                container.innerHTML = "";
                for(var i = 0; i < students.length; i++){
                    container.innerHTML += createCard(students[i]);
                    content.innerHTML += str;
                }
        }
        else{
            alert("Error: " + status);
        }
    });
    
   }
}