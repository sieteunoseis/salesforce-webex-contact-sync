// Define static variables for use across functions
var codeEditor;

// Body Load Functions
document.addEventListener(
  "DOMContentLoaded",
  function () {
    console.log("Page Loaded");

    // Define CodeMirror Settings
    codeEditor = CodeMirror.fromTextArea(codeArea, {
      theme: "monokai",
      lineNumbers: false,
      tabSize: 0,
      lineWrapping: true,
      mode: "text/x-sql",
    });

    // Update CodeMirror size based on window
    width = document.body.clientWidth;
    height = document.body.clientHeight;
  
    if(width > 1200){
      codeEditor.setSize(1000, 400);
    } else {  
      codeEditor.setSize(width * 0.75, 400);
    }
  },
  false
);


var onresize = function () {
  width = document.body.clientWidth;
  height = document.body.clientHeight;

  if(width > 1200){
    codeEditor.setSize(1000, 400);
  } else {  
    codeEditor.setSize(width * 0.75, 400);
  }
};

window.addEventListener("resize", onresize);