
    <div class="mainContent">

      <div id="animaplayer">
      </div>

      <form id="animaform" action="#" method="POST" enctype="multipart/form-data">
        <label for="animage">Photo</label>
        <input type="file" id="animage" name="animage" multiple>
        <input type="submit" id="submit" value="Valider"/>
      </form>

    </div>

<script>
jQuery(document).ready(function($) {

  $( "#animage" ).change(function() {
    $('#animaform').submit();
  });

  var maincontent = $('.mainContent');

  $('#animaform').submit(function(event) {

    event.preventDefault();  // Empêcher le rechargement de la page.

    maincontent.removeClass('error');
    maincontent.removeClass('success');
    maincontent.addClass('loading');

    var form = $('form');
    var file = $('#animage');
    var uploadbutton = $('#submit');

    uploadbutton.attr('value', 'Upload...');

    var formData = new FormData();

    formData.append('sampleFile', file.prop("files")[0]);
    var fichier = file.prop("files")[0]['name'];

    $.ajax({
      url: 'http://192.168.2.50:3000/upload',
      data: formData,
      processData: false,
      contentType: false,
      type: 'POST',
      success: function(data){
        console.log(data);

        if (data == null) {
          notAnAnimal();
        }
        else {
          maincontent.removeClass('loading');
          maincontent.removeClass('error');
          maincontent.addClass('success');
          $('#animaplayer').html('<audio controls autoplay><source src="tmp/' + fichier + '.mp3" type="audio/ogg"><source src="tmp/' + fichier + '.png.mp3" type="audio/mpeg">Met à jour ton navigateur de cromagnon connard</audio>');
        }

      },
      error : function(resultat, statut, erreur){
        console.log(erreur);
        maincontent.removeClass('loading');
        maincontent.removeClass('success');
        maincontent.addClass('error');
      }
    });



  });

  function notAnAnimal() {
    maincontent.removeClass('loading');
    maincontent.removeClass('success');
    maincontent.addClass('error');
    $('#animaplayer').html('<audio controls autoplay><source src="interface/assets/audio/wrong.wav" type="audio/ogg"><source src="interface/assets/audio/wrong.wav" type="audio/mpeg">Met à jour ton navigateur de cromagnon connard</audio>');
  }

});

</script>
