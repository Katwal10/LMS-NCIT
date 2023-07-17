
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
  
  function confirmLogout() {
    if (confirm("Are you sure you want to logout?")) {
      window.location.href = "LogIn.html";
    }
  }
  
  document.addEventListener("DOMContentLoaded", function () {
    const inventoryContainer = document.getElementById("inventoryContainer");
    inventoryContainer.addEventListener("click", function () {
      window.location.href = "InventoryForm.html";
    });
  });
  
  document.addEventListener("DOMContentLoaded", function () {
    const inventoryContainer = document.getElementById("studentAccContainer");
    inventoryContainer.addEventListener("click", function () {
      window.location.href = "StudentAccForm.html";
    });
  });
  