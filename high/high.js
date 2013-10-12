var dancer = new Dancer();
var array = 0;
var note;
var notes = [];
var index = 0;
var prev2="";
var scientific="";
var nancount = 0;
var MIN_LENGTH = 10;
var VOLUME_THRESHOLD = .01;
var SAMPLING_RATE = 24000; //change this to your computer's sampling rate

// These are the final results
var notesarr = [];
var durations = [];

// This starts the playing/parsing
dancer.load({ src: 'twinkle2.mp3' });
dancer.play();


dancer.after(0, function(){
  // console.log(dancer.getSpectrum());
  array = dancer.getSpectrum();

  // var max = 0;
  // var max_i = 0;
  // for(var i = 0; i < array.length; i++){
  //  if(array[i] > max){
  //    max = array[i];
  //    max_i = i;
  //  }
  // }
  var merged = false;
  var freq = fuzzy_index(array) * SAMPLING_RATE / 512;
  //console.log(freq);
  if(!isNaN(freq) && freq > 0){
    nancount = 0;
    note = teoria.note.fromFrequency(freq);
    if(scientific == note.note.scientific()){
      notes[index]["duration"] += 1; 
    console.log(scientific);
    } else {
    index++;
    scientific = note.note.scientific();
    notes[index] = {};
    notes[index]["note"] = scientific;
    notes[index]["duration"] = 1;
    console.log(note.note.scientific());
  
  }
    
    // console.log("F# " + array[8] + "max: " + a + " " + array[a]);
  } else{
    if(freq == 0){
    console.log("gap");
    nancount++;
    index++;
    notes[index] = {};
    notes[index]["note"] = "tongue";
    notes[index]["duration"] = 1;
    scientific = 0;
  } else {
      // console.log(" ");
    nancount++;
  }
    if(nancount > 30){
    dancer.pause();
      //console.log("FILTERED, BITCHEEEEES!!!!");
    filter(notes);
    convert(notes)
    console.log(notesarr);
    console.log(durations)
  }
  }
});


function filter(array){
  for(var i = 1; i < array.length; i++){
  //console.log(array[i]["duration"]);
  if(array[i]["duration"] < MIN_LENGTH && array[i]["note"] != "tongue"){
    array.splice(i,1);
    if(i > 1 && array[i]["note"] == array[i-1]["note"]){ //merge
    array[i]["duration"] += array[i-1]["duration"];
    array.splice(i-1,1);
    }
    i--;
  }
  }
  for(var i = 1; i < array.length; i++){
    if(array[i]["note"] == "tongue"){
    array.splice(i,1);
    i--;
  }
  }
  //return array;
}
function fuzzy_index(array){
  var gap = false;
  var max = 0;
  var a = 0;
  for(var i = 0; i < array.length; i++){
    if(array[i] > max){
      max = array[i];
      a = i;
    }
  }
  if(array[a] < VOLUME_THRESHOLD){
    //console.log("gap");
  gap = true;
  }

  var b = a + (array[a+1] > array[a-1] ? 1 : -1);

  if(gap){
    return 0;
  }
  return (array[a] * a + array[b] * b) / (array[a] + array[b]);
  // larger of previous/next
  // [max_i] + [max_i + 1] / 
}

var NOTE_LENGTH = 35;

function convert(array){
  // hackily sets quarter note length to the second item.
  NOTE_LENGTH = notes[2].duration;
  for(var i = 1; i < array.length; i++){
    var note = notes[i];
    console.log(note);
    notesarr[i-1] = [process(note.note)];
    if(note.duration < NOTE_LENGTH * 1.5){
      durations[i-1] = 'q';
    } else if(note.duration < NOTE_LENGTH * 3){
      durations[i-1] = 'h';
    } else if(note.duration < NOTE_LENGTH * 5){
      durations[i-1] = 'w';
    }
  }
}

// Converts A5 to a/4
function process(note){
  note = note.toLowerCase();
  return note.slice(0, -1) + '/' + (parseInt(note.slice(-1)) - 1);
}

