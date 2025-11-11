const map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.Google({
        key: 'AIzaSyA7PI8GPqfQWSC2qemJE-bkc13TLTVR9S8',
        mapType: 'satellite',
        layerTypes: ['layerRoadmap']

      }),
    }),
  ],
  view: new ol.View({
    center: [0, 0],
    zoom: 2,
  }),
});

const chatbotInput = document.querySelector('#chatbot-input textarea');
renderChatUi('Hi there');

// Input listeners
chatbotInput.addEventListener('keypress', async ( e ) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const message = chatbotInput.value;
        clearChatInput();
        await getChatbotResponse(message);
    }
});

// functions
async function getChatbotResponse(message) {
    renderChatUi("(thinking)", '.', 10);
    const response = await fetch('/chat', {
        method: 'post',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify( { q: message } )
    });
    const responseJson = await response.json();

    const responseJsonArray = JSON.parse(responseJson.message);

    console.log(responseJsonArray);

    for (const element of responseJsonArray) {
        if (element.geographic_coordinate && element.zoom_level) { setMapView(map, element.geographic_coordinate, element.zoom_level) }
        if (element.dialogue) { await renderChatUi( element.dialogue ); }
    }
    
}

async function renderChatUi(message, segmentEndDelimiter = '.', messageOnTime = 3, messageOffTime = 1) {
    const messageSegments = message.split(segmentEndDelimiter);
    const chatMessageDisplayElement = document.querySelector('#chat-message-display');
    
    // show each segment sequentially for messageOnTime, then set to '' for messageOffTime, then the next message for messageOnTime and repeat until all segments have been shown
    for (const segment of messageSegments) {

        if (segment.trim() === '' || segment.trim() === '.') { continue; }
        
        chatMessageDisplayElement.innerHTML = '<span class="message-dialogue">' + segment + segmentEndDelimiter + '</span>';
        await new Promise(resolve => setTimeout(resolve, messageOnTime * 1000));

        chatMessageDisplayElement.textContent = '';
        await new Promise(resolve => setTimeout(resolve, messageOffTime * 1000));
    }

    // Optionally clear at the end
    chatMessageDisplayElement.textContent = '';
    return;
}

function clearChatInput() {
    chatbotInput.value = '';
}

function setMapView(map, coordinates, zoom) {
  // coordinate is an array with 2 element, points in 4326
  // map is an ol map reference
  // zoom is the xyz zoom level
  const view = map.getView();
  const transformed = ol.proj.fromLonLat(coordinates);
  view.animate({
    center: transformed,
    zoom: zoom,
    duration: 2000
  })
}
