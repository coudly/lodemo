// import axios from 'axios@0.15.3/dist/axios.min';
import runtime from 'regenerator-runtime/runtime.js'
import axios from 'axios'


const API = 'https://www.random.org/sequences/?col=1&format=plain&rnd=new'  // min=1&max=100&

const employee = [
  '10001', '10002', '10003', '10004', '10005'
]

const el = document.getElementById('__react_content')
el.innerHTML = 'hello world'

class Lottery {
    constructor(opts) {
        this.initPool(opts.pool)
    }

    initPool(pool) {
        this.pool = pool.map((e, i) => ({ j: 0, i, e }))
        this.poolmap = this.pool.reduce((e, i) => {
            e[i.i] = i
            return e
        }, {})
    }

    static async suffix(poolmap) {
        const {status, data} = await axios.get(API, {
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

    async suffixing() {
        const done = await Lottery.suffix(this.poolmap)
        if (done) {
            this.pool = done
        }

        console.log('suffix done:', done)
    }

    drawing(count) {
        console.log(count)
    }
}

const lottery = new Lottery({ pool: employee })
lottery.suffixing().then(() => {
    lottery.drawing(3)
})

//function b(p1) {
//  return new Promise(function(resolve, reject) {
//    setTimeout(() => {
//      resolve('test ' + p1)
//    }, 2000)
//  })
//}

//async function a() {
//  const p2 = await b('world')
//  console.log(p2)
//  return p2;
//}

//a().then(r => {
//  console.log(r + '...')
//})
