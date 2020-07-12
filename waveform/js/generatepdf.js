// (function () {
//   var form = $(".form"),
//     cache_width = form.width(),
//     a4 = [595.28, 841.89]; // for a4 size paper width and height

//   $("#create_pdf").on("click", function () {
//     $("body").scrollTop(0);
//     createPDF();
//   });
//   //create pdf
//   function createPDF() {
//     getCanvas().then(function (canvas) {
//       var img = canvas.toDataURL("image/png"),
//         doc = new jsPDF({
//           unit: "px",
//           format: "a4",
//         });
//       doc.addImage(img, "JPEG", 20, 20);
//       doc.save("Bhavdip-html-to-pdf.pdf");
//       form.width(cache_width);
//     });
//   }

//   // create canvas object
//   function getCanvas() {
//     form.width(a4[0] * 1.33333 - 80).css("max-width", "none");
//     return html2canvas(form, {
//       imageTimeout: 2000,
//       removeContainer: true,
//     });
//   }
// })();
// /*
//  * jQuery helper plugin for examples and tests
//  */

// (function ($) {
//   $.fn.html2canvas = function (options) {
//     var date = new Date(),
//       $message = null,
//       timeoutTimer = false,
//       timer = date.getTime();
//     html2canvas.logging = options && options.logging;
//     html2canvas.Preload(
//       this[0],
//       $.extend(
//         {
//           complete: function (images) {
//             var queue = html2canvas.Parse(this[0], images, options),
//               $canvas = $(html2canvas.Renderer(queue, options)),
//               finishTime = new Date();

//             $canvas
//               .css({ position: "absolute", left: 0, top: 0 })
//               .appendTo(document.body);
//             $canvas.siblings().toggle();

//             $(window).click(function () {
//               if (!$canvas.is(":visible")) {
//                 $canvas.toggle().siblings().toggle();
//                 throwMessage("Canvas Render visible");
//               } else {
//                 $canvas.siblings().toggle();
//                 $canvas.toggle();
//                 throwMessage("Canvas Render hidden");
//               }
//             });
//             throwMessage(
//               "Screenshot created in " +
//                 (finishTime.getTime() - timer) / 1000 +
//                 " seconds<br />",
//               4000
//             );
//           },
//         },
//         options
//       )
//     );

//     function throwMessage(msg, duration) {
//       window.clearTimeout(timeoutTimer);
//       timeoutTimer = window.setTimeout(function () {
//         $message.fadeOut(function () {
//           $message.remove();
//         });
//       }, duration || 2000);
//       if ($message) $message.remove();
//       $message = $("<div ></div>")
//         .html(msg)
//         .css({
//           margin: 0,
//           padding: 10,
//           background: "#000",
//           opacity: 0.7,
//           position: "fixed",
//           top: 10,
//           right: 10,
//           fontFamily: "Tahoma",
//           color: "#fff",
//           fontSize: 12,
//           borderRadius: 12,
//           width: "auto",
//           height: "auto",
//           textAlign: "center",
//           textDecoration: "none",
//         })
//         .hide()
//         .fadeIn()
//         .appendTo("body");
//     }
//   };
// })(jQuery);

$("#generate-pdf").on("click", function() {
    // function generatePdf() {
    var doc = new jsPDF();
    html2canvas(document.querySelector("#canvas")).then(function(canvas) {
        doc.text(20, 20, "PDF Generated for Spectrum");
        doc.line(20, 25, 60, 25);

        var imgData = canvas.toDataURL("image/png");

        var pageHeight = 295;
        var imgWidth = (canvas.width * 50) / 210 + 4;
        var imgHeight = (canvas.height * imgWidth) / canvas.width;
        var heightLeft = imgHeight;
        var position = 30;
        var left = 12;

        doc.addImage(imgData, "PNG", left, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        doc.autoTable({ html: "#my-table" });
        doc.autoTable({
            styles: { halign: "center", valign: "bottom" },

            head: [
                ["Name", "sample rate(kHz)", "Bit Rate(kbps)", "LUFS"]
            ],
            startY: imgHeight + position + 10,
            // tableLineWidth: 200,
            body: [
                [
                    document.getElementById("name").textContent,
                    document.getElementById("sample-rate").textContent,
                    document.getElementById("bit-rate").textContent,
                    document.getElementById("lufs").textContent,
                ],
                // ...
            ],
        });
        doc.output("dataurlnewwindow");
        doc.save(Date.now() + ".pdf");
    });
});