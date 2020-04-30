import {LitElement, html} from 'lit-element'


export class DatMonitor extends LitElement {
  constructor(){
    super()
    this.monitorDat = null
    this.archives = []
    this.error = ""
    console.log("monitor url is:",this.url)
  }
  firstUpdated(x){
    this.loadMonitorDat()

  }
  render(){
    console.log("FROM RENDER IN DAT-MONITOR, URL is", this.url)
    return html`
    <div>
      <span id="error">${this.error}</span>
      <table>
        <tr>
          <th>Title</th>
          <th>Description</th>
          <th>URL</th>
          <th>Key</th>
          <th>Version</th>
          <th>Peers</th>
        </tr>
      ${this.archives.map(archive=>{ return html`
        <tr>
          <td>${archive.title}</td>
          <td>${archive.description}</td>
          <td>${archive.url}</td>
          <td>${archive.key}</td>
          <td>${archive.version}</td>
          <td>${archive.peers}</td>
        </tr>`
      })}
    </div>`
  }


  static get properties(){
    return {
      url: {type: String, attribute:'monitor-url'},
      archives: {type: Array},
      error: {type:String}
    }
  }


  async loadMonitorDat(){
    try{
      console.log("trying to load: ", this.url)
      this.monitorDat = await DatArchive.load(this.url)
      this.monitorEvent = this.monitorDat.watch(['/monitor-dat.json'])

      this.monitorEvent.addEventListener('invalidated', ()=> {console.log("CHANGE WAS CALLED!!!"); this.getStats()})
      this.getStats()
    }catch (e){
      this.error = `Error: could not load monitorDat: ${e}`
    }
  }


  async getStats(){
    console.log("getstatscalled!")
    try{
      const file = await this.monitorDat.readFile('/monitor-dat.json')
      const stats = JSON.parse(file)
      this.archives = stats.archives
    }catch (e){
      this.error = `Error: could not read stats from monitorDat: ${e}`
    }
    this.requestUpdate()
  }
}
customElements.define('dat-monitor', DatMonitor);
