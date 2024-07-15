
export default function Home() {
  return (
    <form className="flex flex-col items-center align-middle gap-3" >
      <div className="flex flex-col items-start">
        <label >Username:</label>
        <input 
          type="text" 
          placeholder="Username" 
          className="input" 
        />
      </div>
      <div className="flex flex-col items-start">
        <label >Password:</label>
        <input 
          type="text" 
          placeholder="Password" 
          className="input" 
        />
      </div>
      <button className="bg-blue-500 py-2 px-20 rounded-2xl" >Submit</button>
    </form>
  );
}
