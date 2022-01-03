import { Component, h } from 'preact'
import { Planet, PlanetLevel } from '@darkforest_eth/types'
import GameManager from '../../declarations/src/Backend/GameLogic/GameManager'
import GameUIManager from '../../declarations/src/Backend/GameLogic/GameUIManager'
import { PlanetLink } from '../components/PlanetLink'
import { Header, Sub, Title } from '../components/Text'
import { Table } from '../Components/Table';
import { ManageInterval } from '../Components/ManageInterval'

import { distributeSilver } from '../strategies/DistributeSilver'
import { withdrawSilver } from '../strategies/WithdrawSilver'

import { capturePlanets } from '../strategies/Crawl'
import { availableSilver, buttonGridStyle, energy, getMyPlanets, hasPendingMove, isAsteroid, planetName, PlanetTypes, PrimeMinutes, SelectedPlanetProp } from '../utils'
import { config } from 'plugins/config'

const pauseable = require('pauseable')

declare const df: GameManager
declare const ui: GameUIManager

function onDistributeClick(selectedPlanet: Planet|null = null) {
  distributeSilver({
    fromId: selectedPlanet?.locationId,
    fromMinLevel: selectedPlanet?.planetLevel || config.MIN_LEVEL_ASTEROID,
    fromMaxLevel: selectedPlanet?.planetLevel || config.MAX_LEVEL_ASTEROID,
    fromPlanetType: selectedPlanet?.planetType || PlanetTypes.ASTEROID,
    toMinLevel: config.MIN_LEVEL_PLANET,
    toPlanetTypes: [PlanetTypes.PLANET, PlanetTypes.RIP],
  })
}

function onWithdrawClick(selectedPlanet: Planet|null = null) {
  withdrawSilver({
    fromId: selectedPlanet?.locationId
  })
}

export class FullSilver extends Component
{
  interval: any

  constructor() {
    super()
    this.interval = pauseable.setInterval(PrimeMinutes.ELEVEN * config.TIME_FACTOR, () => {
      onDistributeClick()
      onWithdrawClick()
    })
    // this.interval.pause()
  }

  render()
  {
    const headers = ['Planet Name', 'Level', 'Silver'];
    const alignments: Array<'r' | 'c' | 'l'> = ['l', 'r', 'r'];

    const rows = getMyPlanets()
      .filter(p => p.planetLevel >= config.MIN_LEVEL_ASTEROID)
      .filter(p => p.planetType === PlanetTypes.ASTEROID)
      .filter(p => availableSilver(p) == p.silverCap)
      .sort((a, b) => b.silverCap - a.silverCap)

    const columns = [
      (planet: Planet) => <PlanetLink planet={planet}>{planetName(planet)}</PlanetLink>,
      (planet: Planet) => <Sub>{planet.planetLevel}</Sub>,
      (planet: Planet) => <Sub>{planet.silverCap / 1000}K</Sub>,
    ];

    return <div>
      <Header>Full Silver</Header>
      <ManageInterval interval={this.interval} />
      <div style={buttonGridStyle}>
        <button onClick={() => onDistributeClick(ui.getSelectedPlanet())}>Distribute</button>
        <button onClick={() => onWithdrawClick(ui.getSelectedPlanet())}>Withdraw</button>
      </div>
      <Table
        rows={rows}
        headers={headers}
        columns={columns}
        alignments={alignments}
      />
    </div>
  }

  componentWillUnmount() {
    this.interval.clear()
  }
}
