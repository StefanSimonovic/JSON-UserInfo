function loadFile() {
  let input, file, fr, urlinput;
  input = document.getElementById('fileinput');
  urlinput = document.getElementById('urlinput').value; //I generated data i need on this link https://api.myjson.com/bins/189ral

  //first check if both inputs are empty
  if(urlinput == '' && !input.files[0]){
    alert("Please enter URL or choose JSON file from local drive!");
  } 
  //now checking if there is no file selected 
  else if(!input.files[0]) {
    //try to check if URL is valid adress
    const myRe = /((https?\:\/\/)|(www\.))(\S+)(\w{2,4})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    let mA = urlinput.match(myRe);
    if(mA != null){
      let a = new XMLHttpRequest();
      a.open("GET", `${urlinput}`, true);
      a.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
              receivedText(this.responseText);
          }
          else {
            //empty string
          }       
      }
      a.send();            
    }
    else {
      alert("Not valid URL.");
    }
  } 
  //Else URL input is empty, and JSON is loaded localy
  else {
    if (typeof window.FileReader !== 'function') {
      alert("The file API isn't supported on this browser yet.");
      return;
    }
    if (!input) {
      alert("Could not find the file input element.");
    }
    else if (!input.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
      alert("Please select a file before clicking 'Load'");
    }
    else {
      file = input.files[0];
      fr = new FileReader();
      fr.readAsText(file);
      fr.onload = function(e) {
        const lines = e.target.result;
        receivedText(lines);  
      };
    }
  }  
}

//Make <select> and populate the <options> with names of Users
function receivedText(lines) {
  const newArr = JSON.parse(lines);   
  let div = document.getElementById('users');
  
  var opt = '<select id="selectUser">';
      opt += "<option disabled selected value> -- select an option -- </option>";

  for (let i = 0; i < newArr.length; i++) {
      opt += "<option>";
      opt += `${newArr[i].firstName}`;
      opt += ` ${newArr[i].surname}`;
      opt += "</option>";
  }
      opt += "</select>";
      div.innerHTML = opt;
      showInfo(newArr);
    }

//Finding the selected User from list and displaying data
function showInfo(resArr) {
  var select = document.getElementById("selectUser");
  select.onchange = function() {
      var selIndex = select.selectedIndex;
      var selValue = select.options[selIndex].innerHTML;
      
      function selectedUser(selectValue, myArray){
        for (let i=0; i < myArray.length; i++) {
          if ((myArray[i].firstName + ' ' + myArray[i].surname) === selectValue) {
            return myArray[i];
          }
        }
      }

      const obj = selectedUser(selValue, resArr);

      const dirFriends = directFriends(obj, resArr);
      const firstParag = document.getElementById("infoFriends users");
      let infoFriends = "<b>Direct friends: </b>";
      for (let i = 0; i < dirFriends.length; i++) {
          infoFriends += `${dirFriends[i].firstName}`;
          infoFriends += ` `;
          infoFriends += ` ${dirFriends[i].surname}`;
          if(i == (dirFriends.length-1)) {
            infoFriends += `.`;  
          } else {
            infoFriends += `, `;
          }
      }
      firstParag.innerHTML = infoFriends;

      const secParag = document.getElementById("infoFrOfFr users");
      const findOthers = frOfFriends(obj, dirFriends, resArr);
      let fOF = "<b>Friends of the friends: </b>";
      for (let i = 0; i < findOthers.length; i++) {
          fOF += `${findOthers[i].firstName}`;
          fOF += ` `;
          fOF += ` ${findOthers[i].surname}`;
          if(i == (findOthers.length-1)) {
            fOF += `.`;  
          } else {
            fOF += `, `;
          }
      }
      secParag.innerHTML = fOF;

  }
}

function directFriends(myObj, myArray) {
  const dirFriends = [];
  for (let i = 0; i < myArray.length; i++) {
      for(let k = 0; k < myArray[i].friends.length; k++){
        if (myArray[i].friends[k] == myObj.id) {
          dirFriends.push(myArray[i]);
        }                          
      }
  }
  return dirFriends; 
}

function frOfFriends(mainObj,friendArr, myArray) {
  let frOfFriends = [];
  let myObj;
  for(let i = 0; i < friendArr.length; i++) {
    myObj = friendArr[i];
    const allIndFriends = directFriends(myObj, myArray);
    for(let j = 0; j < allIndFriends.length; j++){
      if((allIndFriends[j].firstName == mainObj.firstName) && (allIndFriends[j].firstName == mainObj.firstName))
        continue;
      frOfFriends.push(allIndFriends[j]);

    }
  }  
  //removing duplicates
  let arrWithoutDuplicates = Array.from(new Set(frOfFriends));
  return arrWithoutDuplicates;
}
