// import axios from 'axios@0.15.3/dist/axios.min';
import 'regenerator-runtime/runtime.js'
import axios from 'axios'
import Debug from 'debug'


const API_INT = 'https://www.random.org/integers/?num=1&col=1&base=10&format=plain&rnd=new' //&min=0&max=100
const API_ARR = 'https://www.random.org/sequences/?col=1&format=plain&rnd=new'  // min=1&max=100&

const employee = [
  '10001', '10002', '10003', '10004', '10005'
]

const levelSetting = {
    '1st': { count: 1, mutle: false },
    '2nd': { count: 1, mutle: false },
    '3rd': { count: 1, mutle: false },
    'suning': { count: 30, mutle: true }
}

const el = document.getElementById('__react_content')
el.innerHTML = 'hello world'

/**
 * Random.Org Client
 */
class RandomOrgClient {

    /**
     * suffix sequences
     */
    static async suffix(max) {
        const {status, data} = await axios.get(API_ARR, {
            method: 'get',
            responseType: 'text',
            params: {
                min: 0,
                max
            },
            transformResponse: data => data.trim().split('\n').map(i => Number(i))
        })

        if (status === 200) {
            return data
        } else {
            alert('remote api error')
            // TODO: fail down, use local random
        }

        return false
    }

    /**
     * drawing integer
     */
    static async drawing(max) {
        const {status, data} = await axios.get(API_INT, {
            method: 'get',
            responseType: 'text',
            params: {
                min: 0,
                max
            },
            transformResponse: data => Number(data.trim())
        })

        if (status === 200) {
            return data
        } else {
            alert('remote api error')
            // TODO: fail down, use local random
        }

        return false
    }
}

/**
 * Lottery Service
 */
class Lottery {
    constructor(opts) {
        this.log = Debug('Lottery:service')
        this.winner = []
        this.initPool(opts.pool)
    }

    static _winnerModel = {
        employeeId: '',
        prizeKey: '',
        gmtDrawTime: null
    };

    static async suffix(poolmap) {
        const {status, data} = await axios.get(API_ARR, {
            method: 'get',
            responseType: 'text',
            params: {
                min: 0,
                max: Object.keys(poolmap).length - 1
            },
            transformResponse: data => data.trim().split('\n').map(i => Number(i))
        })

        if (status === 200) {
            return data.map(i => poolmap[i])
        } else {
            alert('remote api error')
        }

        return false
    }

    initPool(pool) {
        this.pool = pool.map((employeeId, i) => ({ i, employeeId }))
        this.poolmap = this.pool.reduce((e, i) => {
            e[i.i] = i
            return e
        }, {})
        this.log('initPool done')
    }

    printWinner(printer) {
        this.winner.forEach((i, j) => printer(i, j))
    }

    async suffixing() {
        const { poolmap } = this
        const max = Object.keys(poolmap).length - 1

        const suffixedArray = await RandomOrgClient.suffix(max)
        if (suffixedArray) {
            this.pool = suffixedArray.map(i => poolmap[i])
            this.log('remote suffix done', this.pool)
        } else {
            this.log('remote suffix error')
        }
    }

    /**
     * drawing on luckman
     * @param count {Number} how many luckman
     * @param isMulti {Boolean} enable multiple win prize
     */
    async drawing(count, prizeKey, isMulti) {
        let _count = parseInt(count, 10)
        if (isNaN(_count) || 0 >= _count || _count > this.pool.length) {
            _count = 1
            this.log('count invalid, fix to 1')
        }

        const max = this.pool.length - 1
        const randInt = await RandomOrgClient.drawing(max)
        if (randInt !== false) {
            const godChosen = this.pool[randInt]
            const { employeeId } = godChosen
            this.log('remote draw done', randInt, godChosen)
            
            this.winner.push({ ...Lottery._winnerModel, employeeId, prizeKey, gmtDrawTime: new Date() })

            if (!isMulti) {
                const lastPlayer = this.pool.filter((i, j) => j !== randInt).map(i => i.employeeId)
                this.log('last player', lastPlayer)
                this.initPool(lastPlayer)
            }
            
            return employeeId
        } else {
            this.log('remote suffix error')
        }
        return false
    }
}


class Test {
    static main() {
        window.localStorage.setItem('debug', 'Lottery:*')
        const log = Debug('Lottery:test')
        
        const lottery = new Lottery({ pool: employee, level: levelSetting })

        log('test remote suffix...')

        lottery.suffixing().then(() => {
            log('remote suffix done')

            lottery.drawing(1, '1st Prize', false).then((eid) => {
                log('draw done', eid)

                lottery.printWinner(i => {
                    console.log(i)
                })
            })
        })
    }
}

Test.main()
