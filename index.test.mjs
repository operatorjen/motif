import { Motif } from './index.mjs'

const colors = {
  reset: '\x1b[0m', taste: '\x1b[92m', rut: '\x1b[91m', growth: '\x1b[93m',
  emerging: '\x1b[96m', header: '\x1b[1m\x1b[95m', label: '\x1b[1m\x1b[97m'
}

class MotifTest {
  constructor() {
    this.detector = new Motif({
      plasticityThreshold: 0.6, stabilityThreshold: 0.7,
      qualityThreshold: 0.5, refinementStrength: 0.6
    })
    this.cycleCount = 0
    this.testInputs = this.generateTestInputs()
  }

  generateTestInputs() {
    return [
      { type: 'simple', complexity: 0.3, novelty: 0.2, content: 'basic pattern [rut]' },
      { type: 'simple', complexity: 0.4, novelty: 0.1, content: 'repeated observation [rut]' },
      { type: 'complex', complexity: 0.8, novelty: 0.7, content: 'nuanced observation with multiple dimensions [complex]' },
      { type: 'complex', complexity: 0.9, novelty: 0.8, content: 'novel synthesis of disparate concepts [complex]' },
      { type: 'complex', complexity: 0.7, novelty: 0.6, content: 'detailed analysis with subtle distinctions [complex]' },
      { type: 'mixed', complexity: 0.5, novelty: 0.4, content: 'balanced perspective [mixed]' },
      { type: 'mixed', complexity: 0.6, novelty: 0.5, content: 'evolving understanding [mixed]' }
    ]
  }

  getRandomInput() { return this.testInputs[Math.floor(Math.random() * this.testInputs.length)] }

  formatMotif(motif) {
    const color = colors[motif.type] || colors.reset
    return `${color}● ${motif.type.toUpperCase()}${colors.reset} | Quality: ${motif.quality.toFixed(2)} | ` +
           `Plasticity: ${motif.plasticity.toFixed(2)} | Stability: ${motif.stability.toFixed(2)} | Lifespan: ${motif.lifespan} cycles`
  }

  formatJudgment(judgment) {
    const level = judgment?.level || 'unknown', confidence = judgment?.confidence || 0, nuance = judgment?.nuance || 'unknown'
    return `Judgment: ${colors.label}${level}${colors.reset} | Confidence: ${(confidence * 100).toFixed(1)}% | Nuance: ${nuance}`
  }

  formatState(state) {
    return `State: ${colors.label}Plasticity ${state.plasticity.toFixed(2)}${colors.reset} | Quality ${state.quality.toFixed(2)} | ` +
           `Coherence ${state.coherence.toFixed(2)}`
  }

  formatRefinementInfluences(O, feedback) {
    const influences = []
    if (O?.judgment?.confidence > 0.7) influences.push('high confidence → increased refinement')
    if (O?.complexity > 0.6) influences.push('complex output → broader interactions')
    if (feedback?.quality > 0.7) influences.push('quality feedback → faster learning')
    if (feedback?.challenges) influences.push('challenging feedback → increased exploration')
    return influences.length > 0 ? influences.join(' | ') : 'standard refinement'
  }

  async runCycle() {
    this.cycleCount++
    const input = this.getRandomInput()
    const currentState = {
      framework: {
        complexity: 0.5 + (this.cycleCount * 0.01),
        coherence: 0.6 + (Math.random() * 0.2),
        adaptability: 0.4 + (Math.random() * 0.3)
      },
      plasticity: 0.5 + (this.cycleCount * 0.005),
      quality: 0.5 + (this.cycleCount * 0.003)
    }

    console.log(`\n${colors.header}=== CYCLE ${this.cycleCount} ===${colors.reset}`)
    console.log(`Input: ${input.content} [${input.type}, complexity: ${input.complexity}, novelty: ${input.novelty}]`)
    const result = this.detector.update(input, currentState, 1.0)
    console.log(this.formatJudgment(result.O.judgment))

    const feedbackQuality = result.StP.lastFeedback?.quality || 0
    const learningPotential = result.StP.lastFeedback?.learning_potential || 0
    console.log(`Feedback: ${feedbackQuality.toFixed(2)} quality, ${learningPotential.toFixed(2)} learning`)
    console.log(this.formatState(result.StP))
    console.log(`Refinement: ${this.formatRefinementInfluences(result.O, result.StP.lastFeedback)}`)

    if (result.motifs.length > 0) {
      console.log(`\n${colors.label}Active Motifs:${colors.reset}`)
      result.motifs.forEach(motif => {
        console.log(`  ${this.formatMotif(motif)}`)
      })
    } else {
      console.log(`\n${colors.label}No stable motifs detected yet...${colors.reset}`)
    }
  }

  showSystemSummary() {
    const summary = this.detector.getSystemSummary()
    console.log(`\n${colors.header}=== SYSTEM SUMMARY (Cycle ${this.cycleCount}) ===${colors.reset}`)
    console.log(`Total Active Motifs: ${summary.totalMotifs}`)
    console.log(`Motif Distribution:`, summary.motifDistribution)
    console.log(`Average Plasticity: ${summary.avgPlasticity.toFixed(2)}`)
    console.log(`Average Quality: ${summary.avgQuality.toFixed(2)}`)
    console.log(`System Age: ${summary.systemAge} cycles`)
    if (summary.currentState.plasticity) {
      console.log(`Current State - Plasticity: ${summary.currentState.plasticity.toFixed(2)}, Quality: ${summary.currentState.quality.toFixed(2)}`)
    }
  }

  async runLoop() {
    await this.runCycle()
    this.showSystemSummary()
    const evolution = this.detector.getFrameworkEvolution()
    if (evolution.length > 1) {
      const first = evolution[0], last = evolution[evolution.length - 1]
      console.log(`\n${colors.label}Evolution Trends:${colors.reset}`)
      console.log(`Plasticity: ${first.plasticity.toFixed(2)} → ${last.plasticity.toFixed(2)}`)
      console.log(`Quality: ${first.quality.toFixed(2)} → ${last.quality.toFixed(2)}`)
    }
  }
}

const runner = new MotifTest()
setInterval(() => { runner.runLoop() }, 800)
