/*
function updateStatus() {
    const userStatus = document.getElementById('userStatus');
    const isOnline = navigator.onLine;
  
    if (isOnline) {
      userStatus.innerHTML = '<img height="35px" src="Logo&Images/User_Network_Status(On).png">';
      userStatus.title = 'User: Online';
    } else {
      userStatus.innerHTML = '<img height="35px" src="Logo&Images/User_Network_Status(Off).png">';
      userStatus.title = 'User: Offline';
    }
  }        
*/
  function checkNetworkStatus() {
    const userStatus = document.getElementById('userStatus');
    
    // Attempt to fetch a resource from your local server
    fetch('/check-network-status')
      .then(response => {
        if (response.ok) {
          // The server is accessible, indicating online status
          userStatus.innerHTML = '<img height="35px" src="Logo&Images/User_Network_Status(On).png">';
          userStatus.title = 'User: Online';
        } else {
          // The server is not accessible, indicating offline status
          userStatus.innerHTML = '<img height="35px" src="Logo&Images/User_Network_Status(Off).png">';
          userStatus.title = 'User: Offline';
        }
      })
      .catch(error => {
        // An error occurred, indicating offline status
        userStatus.innerHTML = '<img height="35px" src="Logo&Images/User_Network_Status(Off).png">';
        userStatus.title = 'User: Offline';
      });
  }
  
  
  document.addEventListener("DOMContentLoaded", function () {
    const inventoryContainer = document.getElementById("inventoryContainer");
    inventoryContainer.addEventListener("click", function () {
      window.location.href = "InventoryForm.html";
    });
  });
  
  document.addEventListener("DOMContentLoaded", function () {
    const studentAccContainer = document.getElementById("studentAccContainer");
    studentAccContainer.addEventListener("click", function () {
      window.location.href = "StudentAccForm.html";
    });
  });

  document.addEventListener("DOMContentLoaded", function () {
    const adminsetContainer = document.getElementById("adminSettingsContainer");
    adminsetContainer.addEventListener("click", function () {
      window.location.href = "AdminSettings.html";
    });
  });
  