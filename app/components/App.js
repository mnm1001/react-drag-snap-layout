import React, { Component } from 'react'
import 'styles/app.less'
import DragLayout from 'components/DragLayout'
import { loadMockData } from 'api/api'
import { map } from 'lodash'
import MoveAndResizeWrapper from 'components/DragLayout/MoveAndResizeWrapper'

export default class App extends Component {
  componentWillMount() {
    const itemsData = loadMockData()
    this.setState({
      itemsData
    })
  }

  handleChangePosition = (postion) => {
    console.log('handleChangePosition', postion)
  }

  render() {
    const { itemsData } = this.state

    return (
      <div className='app'>
        <DragLayout
          onChangePosition={this.handleChangePosition}
        >
          {map(itemsData, itemData => (
            <MoveAndResizeWrapper
              key={itemData.id}
              {...itemData}
            >
              <div>123</div>
            </MoveAndResizeWrapper>
          ))}
        </DragLayout>
      </div>
    )
  }
}
