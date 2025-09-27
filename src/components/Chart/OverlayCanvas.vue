<template>
  <canvas ref="canvas" class="pointer-events-auto absolute inset-0"></canvas>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'

type Tool = 'none'|'trendline'|'hline'|'fib'
const props = withDefaults(defineProps<{ tool?: Tool }>(), { tool: 'none' })

const canvas = ref<HTMLCanvasElement|null>(null)
let ctx: CanvasRenderingContext2D | null = null
let drawing = false
let start: [number, number] | null = null
const drawings: { type: Tool; points: [number,number][] }[] = []

function drawAll() {
  if (!ctx || !canvas.value) return
  ctx.clearRect(0,0,canvas.value.width, canvas.value.height)
  for (const d of drawings) {
    ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2
    if (d.type==='trendline' && d.points.length===2) {
      ctx.beginPath(); ctx.moveTo(...d.points[0]); ctx.lineTo(...d.points[1]); ctx.stroke()
    }
    if (d.type==='hline' && d.points.length) {
      const y = d.points[0][1]; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.value.width,y); ctx.stroke()
    }
    if (d.type==='fib' && d.points.length===2) {
      const [p1,p2] = d.points
      const levels = [0,0.236,0.382,0.5,0.618,0.786,1]
      ctx.strokeStyle = '#34d399';
      for (const lv of levels) {
        const y = p1[1] + (p2[1]-p1[1])*lv
        ctx.beginPath(); ctx.moveTo(p1[0], y); ctx.lineTo(p2[0], y); ctx.stroke()
      }
    }
  }
}

onMounted(() => {
  if (!canvas.value) return
  const dpr = window.devicePixelRatio || 1
  const resize = () => {
    if (!canvas.value) return
    const rect = canvas.value.getBoundingClientRect()
    canvas.value.width = rect.width * dpr
    canvas.value.height = rect.height * dpr
    canvas.value.style.width = rect.width + 'px'
    canvas.value.style.height = rect.height + 'px'
    ctx = canvas.value.getContext('2d')
    if (ctx) ctx.setTransform(dpr,0,0,dpr,0,0)
    drawAll()
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(canvas.value)

  canvas.value.addEventListener('mousedown', (e) => {
    if (props.tool==='none') return
    drawing = true
    start = [e.offsetX, e.offsetY]
  })
  canvas.value.addEventListener('mousemove', (e) => {
    if (!drawing || !ctx || !start) return
    const current: [number,number] = [e.offsetX, e.offsetY]
    const temp = [...drawings]
    if (props.tool==='trendline') temp.push({ type: 'trendline', points: [start, current] })
    if (props.tool==='hline') temp.push({ type: 'hline', points: [current] })
    if (props.tool==='fib') temp.push({ type: 'fib', points: [start, current] })
    const original = drawings.splice(0)
    drawings.push(...original)
    // draw temp
    drawAll();
    // overlay current preview
    ctx.strokeStyle = '#818cf8'; ctx.lineWidth = 1.5
    if (props.tool==='trendline') { ctx.beginPath(); ctx.moveTo(...start); ctx.lineTo(...current); ctx.stroke() }
    if (props.tool==='hline') { ctx.beginPath(); ctx.moveTo(0,current[1]); ctx.lineTo(canvas.value!.width,current[1]); ctx.stroke() }
    if (props.tool==='fib') {
      const [p1,p2] = [start, current]
      const levels = [0,0.236,0.382,0.5,0.618,0.786,1]
      for (const lv of levels) { const y = p1[1] + (p2[1]-p1[1])*lv; ctx.beginPath(); ctx.moveTo(p1[0], y); ctx.lineTo(p2[0], y); ctx.stroke() }
    }
  })
  canvas.value.addEventListener('mouseup', (e) => {
    if (!drawing || !start) return; drawing = false
    const end: [number,number] = [e.offsetX, e.offsetY]
    drawings.push(props.tool==='hline' ? { type:'hline', points:[end] } : { type: props.tool, points:[start, end] })
    drawAll()
  })

  window.addEventListener('overlay:close', () => { drawings.splice(0); drawAll() })
})
</script>
