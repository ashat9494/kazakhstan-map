// Each question points to an existing, sourced fact in atlas-data.
// Wrong options are alternatives for the exercise, not factual statements.
const QUIZ_BANK = [
  {id:'q01',placeId:'charyn',factIndex:0,question:'Which destination has the Valley of Castles, a side canyon about 3 km long?',options:['Charyn Canyon','Kolsai Lakes','Burabay','Lake Kaindy'],answer:'Charyn Canyon'},
  {id:'q02',placeId:'charyn',factIndex:1,question:'When was Charyn National Park established?',options:['2003','1955','2004','2021'],answer:'2004'},
  {id:'q03',placeId:'kolsai',factIndex:0,question:'How many mountain lakes are in the Kolsai group?',options:['Two','Four','One','Three'],answer:'Three'},
  {id:'q04',placeId:'kolsai',factIndex:2,question:'What landscape surrounds Lower Kolsai Lake?',options:['A coniferous gorge','A city square','A salt shore','A stone valley'],answer:'A coniferous gorge'},
  {id:'q05',placeId:'kaindy',factIndex:1,question:'What formed Lake Kaindy after the 1911 earthquake?',options:['A new volcano','A landslide','A meteorite','A glacier'],answer:'A landslide'},
  {id:'q06',placeId:'kaindy',factIndex:2,question:'What rises above the water of Lake Kaindy?',options:['Stone balls','Spruce trunks','A golden egg','Dark pebbles'],answer:'Spruce trunks'},
  {id:'q07',placeId:'altyn',factIndex:1,question:'Which attraction is in Altyn-Emel National Park?',options:['The Singing Dune','The Valley of Castles','The Bolektau viewpoint','The Yasawi Mausoleum'],answer:'The Singing Dune'},
  {id:'q08',placeId:'altyn',factIndex:2,question:'Which mountain pair is inside Altyn-Emel National Park?',options:['Tian Shan and Altai','Aktau and Katutau','Okzhetpes and Zhumbaktas','Bolektau and Aktau'],answer:'Aktau and Katutau'},
  {id:'q09',placeId:'burabay',factIndex:0,question:'Which observation point does the Burabay marker represent?',options:['Bolektau','Singing Dune','Karavansaray','Valley of Castles'],answer:'Bolektau'},
  {id:'q10',placeId:'turkistan',factIndex:0,question:'What was Turkistan once called?',options:['Yasi','Astana','Bolektau','Baikonur'],answer:'Yasi'},
  {id:'q11',placeId:'turkistan',factIndex:2,question:'In which year did the Karavansaray tourist complex open?',options:['1955','2003','2004','2021'],answer:'2021'},
  {id:'q12',placeId:'yasawi',factIndex:2,question:'In which year was the Yasawi Mausoleum added to the UNESCO World Heritage List?',options:['2004','2021','2003','1955'],answer:'2003'},
  {id:'q13',placeId:'yasawi',factIndex:1,question:'Whose death stopped construction of the Yasawi Mausoleum?',options:['Timur','Yuri Gagarin','Samruk','Khoja Ahmed Yasawi'],answer:'Timur'},
  {id:'q14',placeId:'baiterek',factIndex:1,question:'Which bird lays a golden egg in the Baiterek legend?',options:['Samruk','An eagle','A swan','A crane'],answer:'Samruk'},
  {id:'q15',placeId:'baiterek',factIndex:2,question:'How many worlds does the design of Baiterek symbolise?',options:['One','Two','Three','Four'],answer:'Three'},
  {id:'q16',placeId:'baikonur',factIndex:0,question:'When was Baikonur Cosmodrome founded?',options:['2021','1955','2004','2003'],answer:'1955'},
  {id:'q17',placeId:'baikonur',factIndex:1,question:'Who began the first human orbital flight from Baikonur in 1961?',options:['Yuri Gagarin','Timur','Khoja Ahmed Yasawi','Samruk'],answer:'Yuri Gagarin'},
  {id:'q18',placeId:'alakol',factIndex:0,question:'What type of lake is Alakol?',options:['A closed-basin salt lake','A mountain glacier','A river delta','A volcanic crater'],answer:'A closed-basin salt lake'},
  {id:'q19',placeId:'balkhash',factIndex:0,question:'Which river supplies most of Lake Balkhash’s water?',options:['The Ili River','The Charyn River','The Ural River','The Irtysh River'],answer:'The Ili River'},
  {id:'q20',placeId:'mangystau',factIndex:0,question:'What is another name for the Torysh tract?',options:['The Valley of Castles','The Valley of the Balls','The Singing Dune','The Bolektau viewpoint'],answer:'The Valley of the Balls'}
];
