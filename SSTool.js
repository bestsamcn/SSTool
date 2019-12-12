/**操作类型 */
const EventType = {

    /**设置key值 */
    SET:'SET_STORAGE',

    /**清空 */
    CLEAR:'CLEAR_STORAGE',

    /**删除指定key */
    DELETE:'DELETE_STORAGE',

    /**跨页申请 */
    APPLY:'APPLY_STORAGE',

    /**恢复跨页申请 */
    REPLY:'REPLY_STORAGE'
}

/**session管理 */
class SSTool{
    constructor(){
        this._listeners = [];
        this._initialize();
    }

    /**
     * 添加监听
     * @param {function} listener
     */
    addListener(listener){
        this._listeners.push(listener);
    }

    /**
     * 触发
     * @param {string} key 修改的session属性
     * @param {any} values
     */
    _raise(key, values){
        for(let listener of this._listeners){
            typeof listener === 'function' && listener(key, values);
        }
    }

    /**初始化 */
    _initialize(){
        window.addEventListener('storage', this._share.bind(this));
    }

    /**
     * 共享数据
     * @param {{key:string, newValue:string}} key：localstorage.key, newValue最新的sessionstorage
     */
    _share({key, newValue}){

        if(!newValue) return;
        newValue = /^\{.*\}$/.test(newValue) ? JSON.parse(newValue) : JSON.parse(JSON.stringify(window.sessionStorage));
        let changeKey = '';
        if(key.includes(EventType.SET)){
            changeKey = key.split('|')[1];
            for(const key in newValue){
                window.sessionStorage.setItem(key, newValue[key]);
            }
            if(this.isEmpty(newValue)){
                window.sessionStorage.clear();;
            }
        }
        if(key.includes(EventType.CLEAR)){
            changeKey = key.split('|')[1];
            window.sessionStorage.clear();
            window.location.reload();
        }

        if(key.includes(EventType.DELETE)){
            changeKey = key.split('|')[1];
            delete window.sessionStorage[changeKey];
            if(this.isEmpty(newValue)){
                window.sessionStorage.clear();;
            }
        }

        /**回应apply */
        if(key.includes(EventType.APPLY)){
            changeKey = key;
            window.localStorage.setItem(EventType.REPLY, JSON.stringify(window.sessionStorage));
            window.localStorage.removeItem(EventType.REPLY);
        }

        /**乙方获取 */
        if(key.includes(EventType.REPLY)){
            changeKey = key;
            for(const key in newValue){
                window.sessionStorage.setItem(key, newValue[key]);
            }
        }

        this._raise(changeKey, newValue);
    }

    /**主动请求 */
    apply(){
        window.localStorage.setItem(EventType.APPLY, 'abc');
        window.localStorage.removeItem(EventType.APPLY);
    }

    /**查看对象是否为空 */
    isEmpty(obj){
        for(let key in obj){
            return false;
        }
        return true
    }

    /**
     * 本地设置session
     * @param {string} key
     * @param {any} value
     */
    set(key, value){
        window.sessionStorage.setItem(key, value);
        window.localStorage.setItem(EventType.SET+'|'+key, JSON.stringify(window.sessionStorage));
        window.localStorage.removeItem(EventType.SET+'|'+key);
    }

    /**
     * 删除
     * @param {string} key
     */
    delete(key){
        delete window.sessionStorage[key];
        window.localStorage.setItem(EventType.DELETE+'|'+key, JSON.stringify(window.sessionStorage));
        window.localStorage.removeItem(EventType.DELETE+'|'+key);
    }

    /**清空 */
    clear(){
        window.sessionStorage.clear();
        window.localStorage.setItem(EventType.CLEAR+'|clear');
        window.localStorage.removeItem(EventType.CLEAR+'|clear');
    }

    /**
     * 获取指定key值
     * @param {string} key
     */
    get(key){
        return window.sessionStorage.getItem(key);
    }


    /**单例 */
    static _instance = null;
    static get instance(){
        if(this._instance){
            return this._instance;
        }
        this._instance = new SSTool();
        return this._instance;
    }
}
window.SSTool = SSTool;
export default SSTool;
