$(document).ready(function () {
  // Call the console data every 5 seconds
  setInterval(function () {
    $.ajax({
      url: "/console", // URL of the server-side script
      success: function (data) {
        codeEditor.getDoc().setValue(data);
      },
    });
  }, 5000); // Refresh the content every 5 seconds
});
