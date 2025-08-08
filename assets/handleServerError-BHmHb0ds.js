function o(e){n(e===401?"Unable to verify user. Please login again.":e===406?`One of the fields provided is incorrect! 
Please try again.`:e===306?`One of the fields has already been taken! 
Please check the existing list.`:"Something went wrong on our end. Please try again later.")}const n=(e,s="error")=>{const r=document.createElement("div");r.classList.add("error"),s==="success"&&r.classList.add("success"),r.textContent=e,document.querySelector(".error-container").appendChild(r),setTimeout(()=>r.remove(),5e3)};export{o as h,n as s};
