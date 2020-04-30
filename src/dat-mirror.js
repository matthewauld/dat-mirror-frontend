import { LitElement, html } from 'lit-element'
import  './dat-monitor.js'

export class DatMirror extends LitElement {
  constructor(){
    super()
    this.dirty = false
    this.instructions = []
    this.monitorUrl = ""
    this.stats = []
    this.error = ""
    this.instructionDat = null
    const url = window.localStorage.getItem("instructionDatUrl")
    //if we have a url saved, load the dat.
    if(url)
      this.loadArchive(url)

  }

  static get properties(){
    return {
      dirty:          {type:Boolean},
      monitorUrl:     {type: String},
      instructions:   {type: Array},
      stats:          {type: Array},
      error:          {type: String},
      instructionDat: {type: Object},
    }
  }







  render(){
    console.log("monitor url in mirro is", this.monitorUrl)
    return html`
    <div>
    <span>${this.error}</span>
    ${this.instructionDat?

      html`<dir><p>Current Dat Mirror: ${this.instructionDat.url}</p></dir>
            <dir><button @click="${this.selectArchive}">Change Dat Mirror</button></dir>`:
      html`<button @click="${this.selectArchive}">Select/Create a Dat Mirror</button>`}

      ${this.instructionDat?
        html`
          <div>
            Monitor Dat Key <input type="text" @blur="${this.updateMonitorUrl}" value="${this.monitorUrl}"></input>
          </div>
          <table>
            ${this.instructions.map((target,index) =>
                html`<tr><td>${target.key}</td><td><button @click="${()=>{this.removeUrl(index)}}">x</button></td></tr>`)}
            <tr><td><input id="new-dat" @blur="${this.addInstruction}"type="text" title="Add Dat Archive to Mirror"></input></td></tr>
          </table>
          <button @click="${this.saveInstructions}" ?disabled="${!this.dirty}">save</button><button @click="${this.getInstructions}" ?disabled="${!this.dirty}">cancel</button>
          `:
        html``}
    ${this.monitorUrl?
      html`<dat-monitor monitor-url="${this.monitorUrl}"></dat-monitor>`:
      html``}
    </div>
      `
  }

  async updateMonitorUrl(e){
    this.monitorUrl = e.target.value
    this.dirty = true
  }

  async saveInstructions(e){
    console.log("called save")
    this.instructionObject.targets = this.instructions
    this.instructionObject.monitorUrl = this.monitorUrl
    this.instructionDat.writeFile('/dat-mirror/config.json',JSON.stringify(this.instructionObject))
    this.dirty = false
  }

  async addInstruction(e){
    const newDat = e.target.value
    e.target.value = ""
    this.instructions.push({key:newDat})
    this.dirty = true
    this.requestUpdate()
  }


  async removeUrl(index){
    this.instructions.splice(index,1)
    this.dirty = true
    this.requestUpdate()
  }


  async selectArchive(){
    //lselect or create instruction dat
    try{
      this.instructionDat = await DatArchive.selectArchive({
        title: "Select you Instruction Dat or create a new one",
        buttonLabel: 'Select profile',
        filters:{
          isOwner:true,
          type: 'instruction-dat'
        }
      })
      this.getInstructions()
    } catch(e){
      console.log(e)
    }

    //set localstorage with chosen dat url
    window.localStorage.setItem("instructionDatUrl",this.instructionDat.url)
    this.getInstructions()
  }


  async loadArchive(url){

    this.instructionDat = await DatArchive.load(url)
    this.getInstructions()
    }
    //read instructions, or write an empty instructionFile if it does not exist


 async getInstructions(){
   let file;
    try {
      file = await this.instructionDat.readFile('/dat-mirror/config.json','utf8')
      console.log("got file",file)
    } catch(e){
      this.instructionDat.mkdir('/dat-mirror')
      this.instructionDat.writeFile('/dat-mirror/config.json',JSON.stringify({targets:[]}))
    }

    //parse and assign instructions

    try {
      const inst = JSON.parse(file)
      this.instructionObject = inst
      if(inst.monitorUrl){
        console.log("setting monitor url!")
        this.monitorUrl = inst.monitorUrl
      }
      if(inst.targets){
        this.instructions = inst.targets
      }
    } catch (e){
      console.log(e)
      this.error = "Could not parse instruction file"
    }
    this.dirty = false

  }


  parseCookies(){
    return new Map(document.cookie.split(';').map((elem)=>{return elem.split('=',2)}))
  }

}


customElements.define('dat-mirror', DatMirror);
