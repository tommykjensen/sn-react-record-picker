import React from 'react';
import axios from 'axios'
import AsyncPaginate from 'react-select-async-paginate'
import { components } from 'react-select'

export default class ReferenceField extends React.Component {
  state = { value: null }

  render = () => (
    <AsyncPaginate
      className="reference-field"
      debounceTimeout={300}
      value={this.state.value}
      loadOptions={this.loadOptions}
      formatOptionLabel={this.formatOptionLabel}
      getOptionLabel={option => option['name'].display_value}
      getOptionValue={option => option.sys_id.display_value}
      onChange={this.onChange}
      isClearable={true}
      filterOption={this.filterOption}
      components={{ SingleValue }}
      placeholder="User"
    />
  )

  filterOption = (option, search) => {
    let query = new RegExp(search, 'gi')
    const fieldVal = option.data['name'].display_value
    const secondaryFieldVal = option.data['email'].display_value
    const userNamedVal = option.data['user_name'].display_value
    const deparmentNamedVal = option.data['department.name'].display_value

    if (fieldVal.match(query) || secondaryFieldVal.match(query) || userNamedVal.match(query) || deparmentNamedVal.match(query) ) return true
  }

  formatOptionLabel = (option) => (
    <DropdownItem
      label={option['name'].display_value}
      secondaryLabel={option['email'].display_value}
      userName={option['user_name'].display_value}
      departmentName={option['department.name'].display_value}
    />
  )

  onChange = value => {
    this.setState({ value })
  }

  loadOptions = async (searchQuery, prevOptions) => {
    let url = this.buildUrl(searchQuery, prevOptions.length)
    let options = []
    let hasMore = false
    try {
      let res = await axios.get(url)
      let data = res.data.result
      if (data.length !== 0) {
        options = data
        hasMore = true
      }
    } catch (err) { console.warn(err) }

    return { options, hasMore }
  }

  buildUrl = (searchQuery, offset) => {
    const url = ['/api/now/table/sys_user?sysparm_query=']
    const responseFields = ['sys_id', 'name', 'email', 'user_name', 'department.name']

    if (searchQuery) {
      url.push(`nameLIKE${searchQuery}^ORemailLIKE${searchQuery}^ORuser_nameLIKE${searchQuery}^ORdepartment.nameLIKE${searchQuery}`)
    }

    // url.push(`^nameISNOTEMPTY`)
    url.push(`^ORDERBYname`)
    url.push('&sysparm_fields=' + responseFields.join(','))
    url.push('&sysparm_limit=' + 20)
    url.push('&sysparm_offset=' + offset)
    url.push('&sysparm_display_value=all')
console.log(url.join(''));
    return url.join('')
  }
}

// formatting selected value to only display main field
const SingleValue = ({ children, ...props }) => (
  <components.SingleValue {...props}>
    {children.props.label}
  </components.SingleValue>
)
class DropdownItem extends React.PureComponent {
  render = () => (
    <div className="dropdownItem">
      
      <table>
        <tr>
          <td>
          <span>{this.props.label}</span>
          </td>
          <td></td>
        </tr>
        <tr>
          <td><span className="">{this.props.departmentName}</span></td>
          <td><span className="">{this.props.userName}</span></td>
        </tr>
      </table>
      
    </div>
  )
}