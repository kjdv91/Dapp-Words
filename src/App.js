
import './App.css';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react'
import Words from './contract/Words.json'; 

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

function App () {

    const [currentAccount, setCurrentAccount] = useState("");

    const [words, setWords] = useState([]); //las palabras q obtenemos de readWords()
    const [word, setWord] = useState(""); //guarda la palabra que el usuario ingresa en el input
    const [Loading, setLoading] = useState(false);//Loading
    const [randomWord, setRandomWord] = useState();
    const [isUsed, setUsed] = useState();


    

//connect wallet 
/*async function requestAccount(){
  await window.ethereum.request({method: "eth_requestAccounts"});
}
*/
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      const accounts = await ethereum.request({ method: "eth_accounts" });
      

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  };

   const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
      
    }
  };

    async function fetch (){
      if(typeof window.ethereum !== 'undefined'){
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, Words.abi, provider);
        try{
          setLoading(true);
          const data = await contract.readWord();
          setWords(data);
          setLoading(false);
        }catch(err){
          console.log("Error:", err);
        }};
    }; 
        
    // función para escribir una nueva palabra en la blockchain, usando la función setWord() de nuestro smart contract
    async function newWord() {
      if (!word  ) return alert("Ingresa una palabra Cripto no puede estar en blanco"); //si no HAY UNA PALABRA QUE INGRESAR regresa está alerta
      
      if (typeof window.ethereum !== "undefined") { 
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
        contractAddress,
          Words.abi,
          signer
        );
        setLoading(true);
        const transaction = await contract.setWord(word);
        await transaction.wait();
        fetch();
        setWord("");
        setLoading(false); 
    }
  };
      
  // función que trae una palabra al azar de la blockchain, usando la función getWord() de nuestro smart contract
  async function viewWord (){
    if(typeof window.ethereum !== 'undefined'){
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, Words.abi, provider);

      try {
        const data = await contract.getWord();
        setRandomWord(data);
      } catch (err) {
        console.log("Error: ", err);
      }
    } 
  };
  //function permite visualizar si una palabra ha sido usada 
  async function wordIsUsed (){
    if(typeof window.ethereum !== 'undefined'){
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, Words.abi, provider);

      try {
        const data = await contract.isUsed(randomWord);
        if(data){
          setUsed("", "Ya fue usada");
        }
        else{
          setUsed("Si puedo usar la palabra " );
        }
      } catch (err) {
        console.log("Error: ", err);}} 
  };
  // función nos va a permitir marcar o indicar una palabra como usada
  // utilizando la función useWord() de nuestro smart contract
  async function markAsUsed() {
    
    if (!randomWord) return;

    if (typeof window.ethereum !== "undefined") {
      await connectWallet();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        Words.abi,
        signer
      );

      const transaction = await contract.useWord(randomWord);
      await transaction.wait();

    }
  }


    useEffect(() => {
      checkIfWalletIsConnected();
    }, [])


  return (
    <div className="App">
      
      <button className='mostrar' onClick={fetch}>MOSTRAR PALABRA</button>
      <hr/><br/>
      <input className='input' placeholder='Nueva palabra' onChange={e => setWord(e.target.value)} value={word}/>
      
      <button className='crear' onClick={newWord}>CREAR PALABRA</button><br/>
      
      {!currentAccount && (
          <button className='connect'  onClick={connectWallet}>
            CONNECT WALLET
          </button>)}

      <br/> <br/>
      
      {Loading && <p>CARGANDO.. 💤</p>}{/*renderizado condicional*/}
      {currentAccount && (
        <ul className="Words">
        {words.map((word) => (
          <li key={word}>{word} </li>
        ))}
      </ul> 
    )}

    <br/>
    <button className='words' onClick={viewWord}>VER PALABRA ALEATORIA</button>
    <br/><br/>{randomWord}<br /><br/>
    
    <button className='words' onClick={wordIsUsed}>¿ESTÁ USADA LA PALABRA?</button>
      <br /><br/>
      {isUsed}<br/><br/>

      <button className='words' onClick={markAsUsed}>MARCAR COMO PALABRA USADA</button>
    </div>
  );
}

export default App;
