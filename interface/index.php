
    <div class="mainContent container col-xs-12">

      <div id="animaplayer">
      </div>

      <form id="animaform" action="#" method="POST" enctype="multipart/form-data">
        <label for="animage"></label>
        <input type="file" id="animage" name="animage" multiple>
        <input type="submit" id="submit" value="Valider"/>
      </form>

      <div id="message">
        <p>Choisissez une image !</p>
      </div>

    </div>

<script>
jQuery(document).ready(function($) {

  $( "#animage" ).change(function() {
    $('#animaform').submit();
  });

  var maincontent = $('.mainContent');
  var message = $('#message p');

  $('#animaform').submit(function(event) {

    event.preventDefault();  // Empêcher le rechargement de la page.

    maincontent.removeClass('error');
    maincontent.removeClass('success');
    maincontent.addClass('loading');

    changerMessage('Veuillez patienter...');

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
          changerMessage('Trouvé !');

          jouerSon('tmp/' + fichier + '.mp3');
        }

      },
      error : function(resultat, statut, erreur){
        console.log(erreur);
        maincontent.removeClass('loading');
        maincontent.removeClass('success');
        maincontent.addClass('error');

        jouerSon('interface/assets/audio/wrong.wav');

        changerMessage('Erreur de connexion');
      }
    });



  });

  function jouerSon(url) {
    var sound = new Howl({
      src: [url]
    });
    sound.play();
  }

  function notAnAnimal() {
    maincontent.removeClass('loading');
    maincontent.removeClass('success');
    maincontent.addClass('error');
    changerMessage('Animal non reconnu');

    jouerSon('interface/assets/audio/wrong.wav');
  }

  function changerMessage(msg) {
    message.html(msg);
  }

});

</script>
