function loadFile() {
  const input = document.getElementById('fileinput');
  //I generated data i need on this link https://api.myjson.com/bins/189ral
  const urlinput = document.getElementById('urlinput').value; 

  //first check if both inputs are empty
  if(urlinput == '' && !input.files[0]){
    alert("Please enter URL or choose JSON file from local drive!");
  } 
  //now checking if there is no file selected, work with urlinput 
  else if(!input.files[0]) {
    /*
    try to check if URL is valid adress, RegEx copied from 
    https://stackoverflow.com/questions/19108749/validate-url-entered-by-user/19108825 
    */
    const regCheck = /((https?\:\/\/)|(www\.))(\S+)(\w{2,4})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    const urlInputMatching = urlinput.match(regCheck);
    if(urlInputMatching != null){
      const req = new XMLHttpRequest();
      req.open("GET", urlinput, true);
      req.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
              receivedText(this.responseText);
          }
          else {
            //empty string
          }       
      }
      req.send();            
    }
    else {
      alert("Not valid URL.");
    }
  } 
  //Else, URL input is empty, and JSON is loaded localy
  else {
  /*
  Copied this and did minor changes, link is:
  https://stackoverflow.com/questions/7346563/loading-local-json-file
  */
    if (typeof window.FileReader !== 'function') {
      alert("The file API isn't supported on this browser yet.");
      return;
    }
    else {
      const file = input.files[0];
      const fr = new FileReader();
      fr.readAsText(file);
      fr.onload = function(e) {
        const lines = e.target.result;
        receivedText(lines);  
      };
    }
  }  
}

//Make <select> and populate the it with the names of Users
function receivedText(textLines) {
  const usersArray = JSON.parse(textLines);   
  const selectUser = document.getElementById('selectUser');
  
  let opt = '<select id="selectedUser">';
      opt += "<option disabled selected value> -- select an option -- </option>";

  usersArray.forEach(function(user) {
      opt += "<option value='usersArray[i].id'>";
      opt += `${user.firstName} ${user.surname}`;
      opt += "</option>";
    });

      opt += "</select>";
      selectUser.innerHTML = opt;
      showInfo(usersArray);
}

//Finding the selected User from list and displaying data
function showInfo(usersArray) {
  const currentUser = document.getElementById("selectedUser");
  currentUser.onchange = function() {

      const selectedIndex = currentUser.selectedIndex;
      const selectedValue = currentUser.options[selectedIndex].innerHTML;      
      const selectedUser = getSelectedUser(selectedValue, usersArray);

      //Get direct friends and show in the first paragraph
      const paragDirFriends = document.getElementById("infoDirFriends");
      const dirFriends = directFriends(selectedUser, usersArray);
      let infoFriends = "<b>Direct friends: </b>";
      dirFriends.forEach(function(dirFriend, index){
          infoFriends += `${dirFriend.firstName} ${dirFriend.surname}`;
          if(index == (dirFriends.length-1)) {
            infoFriends += `.`;  
          } else {
            infoFriends += `, `;
          }
      });      
      paragDirFriends.innerHTML = infoFriends;

      //Get friends of friends and show them in the second paragraph
      const paragFrOfFriends = document.getElementById("infoFrOfFriends");
      const fOfFriends = frOfFriends(selectedUser, dirFriends, usersArray);
      let fOF = "<b>Friends of the friends: </b>";
      fOfFriends.forEach(function(fOfFriend, index){
          fOF += `${fOfFriend.firstName} ${fOfFriend.surname}`;
          if(index == (fOfFriends.length-1)) {
            fOF += `.`;  
          } else {
            fOF += `, `;
          }        
      });      
      paragFrOfFriends.innerHTML = fOF;

      //Get suggested friends and if there are any, show them in the third paragraph
      const paragSuggestedFriends = document.getElementById("suggestFriends");
      const suggestedFriends = suggestFriends(selectedUser, dirFriends, fOfFriends);
      if(suggestedFriends != 0){
        paragSuggestedFriends.style.display = "block";
        let sugFriends = '<strong><span style="color:CornflowerBlue ; ">Suggested friends: </span></strong>';
        suggestedFriends.forEach(function(suggFriend, index){
            sugFriends += `${suggFriend.firstName} ${suggFriend.surname}`;
            if(index == (suggestedFriends.length-1)) {
              sugFriends += `.`;  
            } else {
              sugFriends += `, `;
            }        
        });
        paragSuggestedFriends.innerHTML = sugFriends;
      }
      else {
        paragSuggestedFriends.style.display = "none";
      }

  }      
}


function getSelectedUser(selectedUser, usersArray) {
        for (let i=0; i < usersArray.length; i++) {
          if ((usersArray[i].firstName + ' ' + usersArray[i].surname) === selectedUser) {
            return usersArray[i];
          }
        }
}
//Direct friends: those people who are directly connected to the chosen user
function directFriends(selectedUser, usersArray) {
  const dirFriends = [];
  for (let i = 0; i < usersArray.length; i++) {
      for(let k = 0; k < usersArray[i].friends.length; k++){
        if (usersArray[i].friends[k] == selectedUser.id) {
          dirFriends.push(usersArray[i]);
        }                          
      }
  }
  return dirFriends; 
}

/*
Friends of friends: those who are two steps away from the chosen user 
but not directly connected to the chosen user
*/
function frOfFriends(selectedUser, directFriendsArr, usersArray) {
  const frOfFriendsSet = new Set();
  /*
  Iterate through direct friends, and for each one find direct friends,
  remove selected user and names of direct friends in the final array
  */
  directFriendsArr.forEach(function(dirFriend) {
    const currentDirFriend = dirFriend;
    const allIndFriends = directFriends(currentDirFriend, usersArray);
    allIndFriends.forEach(function(indFriend){
      if((indFriend.firstName == selectedUser.firstName) && (indFriend.surname == selectedUser.surname)){
        return;
      }
      frOfFriendsSet.add(indFriend);
    });
  }); 
  //removing direct friends of the selected user from final set
  directFriendsArr.forEach(function(dirFr) {
      if(frOfFriendsSet.has(dirFr)){  
        frOfFriendsSet.delete(dirFr);
      }
  });
  //Making Array from final set and returning it as a result
  const frOfFriendsArray = Array.from(frOfFriendsSet);
  return frOfFriendsArray;
}

/* 
Suggested friends: People in the group who know 2 or more direct friends 
of the chosen user but are not directly connected to the chosen user (optional)
*/
function suggestFriends(selectedUser, directFriendsArr, frOfFriendsArray) {
  let count = 0;
  let suggFriends = [];
  frOfFriendsArray.forEach(function(user){
    user.friends.forEach(function(friendId){
      if(selectedUser.id != friendId){
        directFriendsArr.forEach(function(dirFriend){
          if(friendId == dirFriend.id){
            count++;
          }
        });       
      }
      else {
        return;
      }
    });  
          if(count >= 2){
            suggFriends.push(user);
          }
          count = 0;          
  });     
    return suggFriends;
}