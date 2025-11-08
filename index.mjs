import { Funnels, ASCENDING, DESCENDING, OSCILLATING } from 'funnels'

const MAX_STATES = 3
const EVOLUTION_HISTORY_SIZE = 50
const HISTORY_LIMIT = 100
const MOTIF_TTL = 60000
const INTERACTION_HISTORY_LIMIT = 10
const RECENT_INPUTS_WINDOW = 5
const FUNNEL_GRAVITY = 0.008
const FUNNEL_FLOOR = 0.05
const MAX_INTERACTION_RADIUS = 0.3
const ENERGY_REGEN_BASE = 0.02
const ENERGY_REGEN_MULTIPLIER = 0.1
const ENERGY_MAX = 2.0
const INITIAL_ENERGY_MIN = 0.6
const INITIAL_ENERGY_RANGE = 0.4
const PLASTICITY_THRESHOLD = 0.7
const QUALITY_THRESHOLD = 0.6
const STABILITY_THRESHOLD = 0.8
const COMPLEXITY_THRESHOLD = 0.7
const CONFIDENCE_THRESHOLD = 0.6
const NOVELTY_THRESHOLD = 0.7
const OSCILLATION_STRENGTH = 0.1
const BAYESIAN_INFLUENCE_BASE = 0.5
const INPUT_SENSITIVITY_BASE = 0.5
const DISCERNMENT_STRENGTH_BASE = 0.5
const COMPLEXITY_WEIGHT = 0.3
const INTERACTION_WEIGHT = 0.2
const STABILITY_WEIGHT = 0.3
const STATE_QUALITY_WEIGHT = 0.2
const ENERGY_QUALITY_WEIGHT = 0.4
const ADAPTABILITY_WEIGHT = 0.3

export class Motif {
  constructor(cf = {}) {
    this.drt = {
      plasticityThreshold: cf.plasticityThreshold || PLASTICITY_THRESHOLD,
      stabilityThreshold: cf.stabilityThreshold || STABILITY_THRESHOLD,
      qualityThreshold: cf.qualityThreshold || QUALITY_THRESHOLD,
      inputSensitivity: cf.inputSensitivity || INPUT_SENSITIVITY_BASE
    } 
    this.funnels = new Funnels({
      energyRegeneration: cf.plasticityRegeneration || ENERGY_REGEN_BASE,
      oscillationStrength: cf.discernmentSensitivity || OSCILLATION_STRENGTH,
      bayesianInfluence: cf.refinementStrength || BAYESIAN_INFLUENCE_BASE,
      floorThreshold: FUNNEL_FLOOR,
      gravity: FUNNEL_GRAVITY,
      minFunnelCount: MAX_STATES,
      maxFunnelCount: MAX_STATES
    })
    this.motifs = new Map()
    this.inputHistory = []
    this.frameworkEvolution = []
    this.motifTTL = cf.ttl || MOTIF_TTL
    this.historyLimit = cf.historyLimit || HISTORY_LIMIT
  }

  update(I, S, deltaTime = 1) {
    this.inputHistory.push({ input: I, state: S, timestamp: Date.now() })
    if (this.inputHistory.length > this.historyLimit) this.inputHistory.shift()
    const O = this._discern(I, S)
    const Ip = this._environmentalFeedback(O)
    const StP = this._refine(O, Ip, S, deltaTime)
    this.frameworkEvolution.push({
      time: this.frameworkEvolution.length, 
      plasticity: StP.plasticity,
      quality: StP.quality, 
      complexity: StP.framework.complexity
    })
    if (this.frameworkEvolution.length > EVOLUTION_HISTORY_SIZE) this.frameworkEvolution.shift() 
    this._detectMotifs()
    return { O, StP, motifs: this.getActiveMotifs(), evolution: this.getFrameworkEvolution() }
  }

  _discern(I, S) {
    const iC = this._calculateiC(I)
    const fC = this._calculateFrameworkCoherence(S)
    const fI = {
      speed: iC * 0.2 + 0.1,
      type: iC > COMPLEXITY_THRESHOLD ? 'complex' : 'simple',
      oscillationPhase: Math.random() * Math.PI * 2,
      lastEnergyChange: 0,
      state: DESCENDING,
      interactionHistory: [],
      energy: INITIAL_ENERGY_MIN + Math.random() * INITIAL_ENERGY_RANGE,
      metadata: { 
        iC,
        frameworkCoherence: fC,
        dS: (iC + fC) / 2
      }
    }
    this.funnels._addFunnel(`drv-${Date.now()}`, [fI])
    return {
      judgment: this._extractJudgment(fI),
      confidence: fI.metadata.dS,
      type: fI.type,
      complexity: iC,
      novelty: this._calculateInputNovelty(I)
    }
  }

  _environmentalFeedback(O) {
    const fQ = O.confidence * (0.8 + Math.random() * 0.4), lS = Math.min(1, O.complexity * fQ)
    return {
      type: 'environmental_feedback',
      quality: fQ,
      learningPotential: lS,
      reinforces: O.confidence > CONFIDENCE_THRESHOLD,
      challenges: O.novelty > NOVELTY_THRESHOLD,
      timestamp: Date.now()
    }
  }

  _refine(O, Ip, S, deltaTime) {
    this._applyOutputInfluence(O)
    this._applyFeedbackInfluence(Ip)
    this._applyStateGuidance(S)
    this.funnels.update(deltaTime)
    const fS = this.funnels.getGlobalState()
    const allFunnels = this.funnels.getAllFunnelStates()
    const rM = this._calculaterM(allFunnels)
    return {
      framework: this._extractFramework(fS, rM, O, Ip),
      plasticity: this._calculateNewPlasticity(fS.energyMean, O, Ip),
      quality: this._calculateStateQuality(fS, rM, O, Ip),
      coherence: rM.coherence,
      adaptability: rM.adaptability,
      lastOutput: O,
      lastFeedback: Ip
    }
  }

  _applyOutputInfluence(O) {
    const cB = O.confidence * 0.3
    this.funnels.cfg.bayesianInfluence = Math.min(0.9, this.funnels.cfg.bayesianInfluence + cB)
    if (O.judgment.level === 'refined') this.funnels.cfg.oscillationStrength *= 1.1
    this.funnels.cfg.interactionRadius = MAX_INTERACTION_RADIUS + (O.complexity * 0.2)
  }

  _applyFeedbackInfluence(Ip) {
    const lA = Ip.quality * ENERGY_REGEN_MULTIPLIER
    this.funnels.cfg.energyRegeneration = Math.max(0.01, Math.min(0.1, this.funnels.cfg.energyRegeneration + lA))
    if (Ip.learningPotential > COMPLEXITY_THRESHOLD) this.funnels.cfg.friction *= 0.95
    if (Ip.reinforces) {
      this.funnels.cfg.turbulence *= 0.9
    } else if (Ip.challenges) {
      this.funnels.cfg.turbulence *= 1.2
    }
  }

  _applyStateGuidance(S) {
    if (S.quality > COMPLEXITY_THRESHOLD) {
      this.funnels.cfg.spiralTightness *= 1.05
    } else {
      this.funnels.cfg.gravity *= 0.95
    }
    const pF = S.plasticity || INPUT_SENSITIVITY_BASE
    this.funnels.cfg.bayesianInfluence *= (INPUT_SENSITIVITY_BASE + pF)
    if (S.framework && S.framework.coherence > 0.8) this.funnels.cfg.interactionRadius *= 0.9
  }

  _calculateNewPlasticity(bP, O, Ip) {
    const cB = O.confidence * OSCILLATION_STRENGTH, fB = Ip.quality * Ip.learningPotential * 0.15, nB = O.novelty * (Ip.challenges ? 0.2 : 0.05)
    return Math.min(ENERGY_MAX, bP + cB + fB + nB)
  }

  _extractFramework(fS, rM, O, Ip) {
    const bF = {
      complexity: rM.complexity,
      coherence: rM.coherence,
      adaptability: rM.adaptability,
      plasticity: fS.energyMean,
      stability: 1 - fS.energyVariance,
      objectCount: fS.totalObjects,
      funnelCount: fS.totalFunnels,
      stateDistribution: fS.stateDist
    }
    if (O.judgment.level === 'refined') {
      bF.coherence *= 1.1
      bF.stability *= 1.05
    }
    if (Ip.reinforces) {
      bF.stability *= 1.1
    } else if (Ip.challenges) {
      bF.adaptability *= 1.15
    }
    return bF
  }

  _calculateStateQuality(fS, rM, O, Ip) {
    const eQ = fS.energyMean * (1 - fS.energyVariance), iQ = rM.interactionDensity * rM.coherence, aQ = rM.adaptability * rM.stateVariety
    let bQ = (eQ * ENERGY_QUALITY_WEIGHT + iQ * INTERACTION_WEIGHT + aQ * ADAPTABILITY_WEIGHT)
    return Math.min(1.0, bQ + (O.confidence * OSCILLATION_STRENGTH) + (Ip.quality * OSCILLATION_STRENGTH) + (Ip.learningPotential * 0.05))
  }

  _detectMotifs() {
    const fSs = this.funnels.getAllFunnelStates()
    const cT = Date.now()
    for (const [id, state] of Object.entries(fSs)) {
      for (const obj of state.objects) {
        if (this._isStableLoop(obj)) {
          const motifId = `${id}-${obj.id}`
          const eM = this.motifs.get(motifId)
          const motif = {
            id: motifId,
            type: this._mapStateToDRTType(obj.state),
            quality: this._calculateMotifQuality(obj),
            plasticity: obj.energy,
            stability: this._calculateStability(obj.interactionHistory),
            coherence: this._calculateMotifCoherence(obj),
            lifespan: eM ? eM.lifespan + 1 : 1,
            firstDetected: eM ? eM.firstDetected : cT,
            lastUpdated: cT,
            interactions: obj.interactionHistory.length,
            stateHistory: [...(eM?.stateHistory || []), {
              state: obj.state, energy: obj.energy, timestamp: cT
            }].slice(-INTERACTION_HISTORY_LIMIT)
          }
          this.motifs.set(motif.id, motif)
        }
      }
    }
    for (const [motifId, motif] of this.motifs.entries()) { if (cT - motif.lastUpdated > this.motifTTL) this.motifs.delete(motifId) }
  }

  _calculateiC(I) {
    if (typeof I === 'object' && I !== null) {
      const keys = Object.keys(I), values = Object.values(I), depth = this._calculateObjectDepth(I)
      return Math.min(1, (keys.length * 0.1 + depth * COMPLEXITY_WEIGHT + values.filter(v => typeof v === 'object' || 
Array.isArray(v)).length * 0.2))
    }
    return typeof I === 'string' ? Math.min(1, I.length / 100) : COMPLEXITY_WEIGHT
  }

  _calculateObjectDepth(obj, c = 0) {
    if (typeof obj !== 'object' || obj === null) return c
    let m = c
    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null) m = Math.max(m, this._calculateObjectDepth(value, c + 1))
    }
    return m
  }

  _calculateFrameworkCoherence(S) {
    if (!S || !S.framework) return DISCERNMENT_STRENGTH_BASE
    const f = S.framework
    return Math.min(1, (f.coherence || 0.5) * (f.adaptability || 0.5) * (f.complexity || 0.5))
  }

  _calculateInputNovelty(I) {
    if (this.inputHistory.length < 2) return 1.0
    const rI = this.inputHistory.slice(-RECENT_INPUTS_WINDOW)
    const c = JSON.stringify(I)
    const si = rI.reduce((max, entry) => {
      const eS = JSON.stringify(entry.input)
      const sim = this._stringSimilarity(c, eS)
      return Math.max(max, sim)
    }, 0)
    return 1 - si
  }

  _stringSimilarity(str1, str2) {
    const lg = str1.length > str2.length ? str1 : str2, sh = str1.length > str2.length ? str2 : str1
    if (lg.length === 0) return 1.0
    return (lg.length - this._editDistance(lg, sh)) / parseFloat(lg.length)
  }

  _editDistance(s1, s2) {
    const m = []
    for (let i = 0; i <= s2.length; i++) { m[i] = [i] }
    for (let j = 0; j <= s1.length; j++) { m[0][j] = j }
    for (let i = 1; i <= s2.length; i++) {
      for (let j = 1; j <= s1.length; j++) {
        if (s2.charAt(i-1) === s1.charAt(j-1)) {
          m[i][j] = m[i-1][j-1]
        } else {
          m[i][j] = Math.min(m[i-1][j-1] + 1, m[i][j-1] + 1, m[i-1][j] + 1)
        }
      }
    }
    return m[s2.length][s1.length]
  }

  _extractJudgment(fI) {
    const state = fI.state || DESCENDING
    const dS = fI.metadata?.dS || DISCERNMENT_STRENGTH_BASE
    const iC = fI.metadata?.iC || COMPLEXITY_WEIGHT
    const energy = fI.energy || INITIAL_ENERGY_MIN
    const type = fI.type || 'simple'
    return {
      level: state === OSCILLATING ? 'refined' : state === ASCENDING ? 'developing' : 'basic',
      nuance: iC > COMPLEXITY_THRESHOLD ? 'nuanced' : 'direct',
      confidence: Math.min(1, dS * (1 + energy * 0.5)),
      rationale: `Discernment with ${type} processing at ${(dS * 100).toFixed(1)}% strength`
    }
  }

  _calculaterM(allFunnels) {
    let totalObjects = 0, totalInteractions = 0, stateDiversity = new Set(), energySum = 0
    for (const [_, state] of Object.entries(allFunnels)) {
      totalObjects += state.objectCount
      energySum += state.avgEnergy
      state.objects.forEach(obj => {
        totalInteractions += obj.interactionHistory.length
        stateDiversity.add(obj.state)
      })
    }
    const iD = totalObjects > 0 ? totalInteractions / totalObjects : 0
    const eS = 1 - (this.funnels.gs.energyVariance || 0.1)
    const stateVariety = stateDiversity.size / MAX_STATES
    return {
      complexity: Math.min(1, totalObjects / 20),
      coherence: eS,
      adaptability: stateVariety * iD,
      interactionDensity: iD,
      stateVariety
    }
  }

  _calculateMotifQuality(obj) {
    const eQ = obj.energy
    const iQ = Math.min(1, obj.interactionHistory.length / 8)
    const stability = this._calculateStability(obj.interactionHistory)
    const stateQuality = obj.state === OSCILLATING ? 1.0 : obj.state === ASCENDING ? COMPLEXITY_THRESHOLD : 0.4
    return (eQ * COMPLEXITY_WEIGHT + iQ * INTERACTION_WEIGHT + stability * STABILITY_WEIGHT + 
      stateQuality * STATE_QUALITY_WEIGHT)
  }

  _calculateStability(history) {
    if (history.length < 3) return 0
    const eT = history.map(h => h.eT)
    const mT = eT.reduce((a, b) => a + b, 0) / eT.length
    const vT = eT.reduce((sum, et) => sum + Math.pow(et - mT, 2), 0) / eT.length
    const c = 1 - Math.min(1, vT)
    const now = Date.now()
    const rI = history.filter(h => now - h.timestamp < this.motifTTL / 2).length
    const recency = Math.min(1, rI / 3) 
    return (c * QUALITY_THRESHOLD + recency * 0.4)
  }

  _calculateMotifCoherence(obj) {
    if (!obj.interactionHistory.length) return 0
    const p = new Set(obj.interactionHistory.map(h => h.with))
    const pD = Math.min(1, p.size / 5)
    const eF = obj.interactionHistory.map(h => h.eT)
    const fC = 1 - (Math.std(eF) / (Math.mean(eF) || 1))
    return (pD * 0.4 + fC * QUALITY_THRESHOLD)
  }

  _isStableLoop(obj) {
    const hE = obj.interactionHistory.length >= 3
    const hP = obj.energy > this.drt.plasticityThreshold
    const isStableState = obj.state === OSCILLATING || (obj.state === ASCENDING && obj.energy > 0.8)
    return hE && hP && isStableState
  }

  _mapStateToDRTType(fS) { return { [DESCENDING]: 'rut', [OSCILLATING]: 'taste', [ASCENDING]: 'growth' }[fS] || 'emerging' }

  getActiveMotifs() {
    return Array.from(this.motifs.values()).filter(m => m.stability > this.drt.stabilityThreshold && m.quality > this.drt.qualityThreshold)
  }

  getFrameworkEvolution() { return this.frameworkEvolution }

  getSystemSummary() {
    const activeMotifs = this.getActiveMotifs()
    const motifTypes = activeMotifs.reduce((acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1
      return acc
    }, {}) 
    return {
      totalMotifs: activeMotifs.length,
      motifDistribution: motifTypes,
      avgPlasticity: activeMotifs.reduce((sum, m) => sum + m.plasticity, 0) / (activeMotifs.length || 1),
      avgQuality: activeMotifs.reduce((sum, m) => sum + m.quality, 0) / (activeMotifs.length || 1),
      systemAge: this.frameworkEvolution.length,
      currentState: this.frameworkEvolution[this.frameworkEvolution.length - 1] || {}
    }
  }
}

Math.mean = function(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length }

Math.std = function(arr) { 
  const mean = Math.mean(arr)
  return Math.sqrt(arr.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / arr.length)
}