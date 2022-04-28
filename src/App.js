
import './App.css';
import { ethers } from 'ethers';
import { useState } from 'react'
import Words from './contract/Words.json'; 

const contractAddress = '0x4B72645ab6187b31f7Cc5F96aCf169Eefc1dCE14';

function App () {

  const [words, setWords] = useState([]);
  const [word, setWord] = useState();
  const [Loading, setLoading] = useState(false);


  async function fetch (){
  if(typeof window.ethereum !== 'undefined'){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, Words.abi, provider);

    try{
      const data = await contract.getWord();
      setWords(data);
    }catch(err){
      console.log("Error:", err);
    }
    
    
  };
  

}; 

//connect wallet 
async function requestAccount(){
  await window.ethereum.request({method: "eth_requestAccounts"});
}

async function  newWord(){
  if(!word) return;
  if(typeof window.ethereum !== 'undefined'){
    await requestAccount();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, Words.abi, signer);
    setLoading(true);
    const transaction = await contract.setWord(word);
    await transaction.wait();

    fetch();
    setLoading(false);

    

    

  }


};

  return (
    <div className="App">
      

      <button onClick={fetch}>Mostrar Palabras</button>
      <hr></hr>
      
      
      <br></br>
      <input placeholder='Nueva palabra' onChange={e => setWord(e.target.value)}/>
      <button onClick={newWord}>Crear Palabra</button>
      <br/> <br/>
      {Loading && <p>Cargando..</p>} {/*renderizado condicional*/}
      <ul className="Words">
        {words.map((word) => (
          <li key={word}>{word}</li>
        ))}
      </ul> 

      
    </div>
  );
}

export default App;
