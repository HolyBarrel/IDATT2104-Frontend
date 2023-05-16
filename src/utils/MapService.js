export default class MapService {

    static async downloadMapData(map) {
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(map));
        var dlAnchorElem = document.getElementById('downloadAnchor');
        dlAnchorElem.setAttribute("href",     dataStr     );
        dlAnchorElem.setAttribute("download", "map.json");
        dlAnchorElem.click();
    }
}