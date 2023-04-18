import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import fs from "fs"
import ytdl from 'ytdl-core';

import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import { Document } from "langchain/document";

import { Chroma } from "langchain/vectorstores/chroma";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
console.log(__dirname); // prints the directory name of the current module

//const FormData = require("form-data");
const OPENAI_API_KEY = "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";


const videoUrl = 'https://www.youtube.com/watch?v=RRubcjpTkks';

// Download the audio from YouTube
const audioStream = ytdl(videoUrl, { filter: 'audioonly' });
const audioFilePath = './audio5.mp4';
audioStream.pipe(fs.createWriteStream(audioFilePath));

audioStream.on('end', () => {
  console.log('Audio downloaded');
  const filePath = path.join(__dirname, 'audio5.mp4');


const model = "whisper-1"; 
const formData = new FormData();
formData.append("model", model);
formData.append("file", fs.createReadStream (filePath));
  axios
  .post("https://api.openai.com/v1/audio/transcriptions", formData, {
    headers:{
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
}, 
  }).then((response) => {
    
    console.log("ok")
    run(response.data);
  })
});


async function run(data){
    


    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 10,
      chunkOverlap: 1,
    });
    
    const docOutput = await splitter.splitDocuments([
      new Document({ pageContent: data }),
    ]);
// Create a Chroma vector store from the documents
const vectorStore = await Chroma.fromDocuments(docOutput, new OpenAIEmbeddings({
    openAIApiKey: "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",
  }), {
    collectionName: 'my_collection'
  });
      
  const response = await vectorStore.similaritySearch("what is data science ", 1);
    
  console.log(response);

     
    
    
}
