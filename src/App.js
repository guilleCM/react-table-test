import React, { Component } from 'react';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import axios from "axios";
import $ from 'jquery';

//local resources
import logo from './logo.svg';
import './App.css';

class CellEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.cellInfo.value,
        };
        this.onChangeValue = this.onChangeValue.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.inputRef = React.createRef();
    }

    componentDidMount() {
        $(this.inputRef.current).focus();
    }

    render() {
        return(
            <div 
                className={this.props.className + " rt-td-edit"}
                onKeyDown={(e) => this.handleKeyDown(e)}
            >
                <input
                    ref={this.inputRef} 
                    style={{width: '100%'}}
                    type="text"
                    value={this.state.value}
                    onChange={(e) => this.onChangeValue(e)}
                />
            </div>
        )
    }

    onChangeValue(event) {
        this.setState({
            value: event.target.value,
        })
    }

    // onBlurInput(event) {
    //     console.log(event)
    // }

    handleKeyDown(event) {
        if (event.key === "Tab") {
            event.preventDefault();
            console.log("handle Tab")
            console.log(event)
            this.props.onCellEdit(this.props.cellInfo, this.state.value)
        }
    }
}

class App extends Component {
    constructor() {
        super();
        this.state = {
            data: [],
            editedData: [],
            pages: null,
            loading: true,
            start: 0,
            limit: 10,
            gridEditor: {
                'rowIndex': null,
                'columnName': null,
            },
            gridNavigator: {
                'rowIndex': null,
                'columnName': null,
            },
            rowLimits: [10, 25, 50, 100, 300],
        };
        this.fetchData = this.fetchData.bind(this);
        this.renderCell = this.renderCell.bind(this);
        this.renderEditableCell = this.renderEditableCell.bind(this);
        this.updateRowsLimit = this.updateRowsLimit.bind(this);
        this.onCellEdit = this.onCellEdit.bind(this);
        this.fixedHeaderRef = React.createRef();
        this.gridRef = React.createRef();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log("update")
        $(this.gridRef.current).find('.rt-thead').clone().appendTo(this.fixedHeaderRef.current);
        if ($(this.fixedHeaderRef.current).children().length > 1) {
            $(this.fixedHeaderRef.current).children().first().remove();
        }
        if (prevState.limit !== this.state.limit) {
            this.fetchData();
        }
        if (JSON.stringify(prevState.editedData) !== JSON.stringify(this.state.editedData)) {
            console.log("edited data callback")
        }
    }

    whatIs(props) {
        console.log(props)
    }

    render() {
        const { data, pages, loading } = this.state;
        return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
            </header>
            
            <div 
                className="ReactTable"
                style={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'white',
                    zIndex: 2,
                    boxShadow: '0 2px 15px 0 rgba(0,0,0,0.15)',
                }}
            >
                <div
                    className="rt-table"
                    ref={this.fixedHeaderRef}>
                </div>
            </div>

            <div ref={this.gridRef}>
                <ReactTable
                    columns={[
                        {
                            Header: props => <span onClick={this.whatIs(props)}><i className="fas fa-cog" /> Tools</span>,
                            Cell: this.renderToolsCell,
                        },                       
                        {
                            Header: props => <span><i className="fas fa-sort"/> ID <i className="fas fa-key"/></span>,
                            accessor: "id",
                            Cell: this.renderCell,
                            },
                        {
                            Header: props => <span><i className="fas fa-sort"/> User </span>,
                            accessor: "userId",
                            Cell: this.renderCell,
                        },
                        {
                            Header: props => <span><i className="fas fa-sort"/> Title </span>,
                            accessor: "title",
                            Cell: this.renderCell,
                        },
                        {
                            Header: props => <span><i className="fas fa-sort"/> Done </span>,
                            accessor: "completed",
                            Cell: this.renderCell,
                        }
                    ]}
                    manual // Forces table not to paginate or sort automatically, so we can handle it server-side
                    data={data}
                    pages={pages} // Display the total number of pages
                    loading={loading} // Display the loading overlay when we need it
                    onFetchData={this.fetchData} // Request new data when things change
                    showPagination={false}
                    // sortable={false}
                    defaultPageSize={10}
                    className="-striped -highlight"
                    id="grid-table"
                    resizable={false}
                />
            </div>

            <div 
                className="GridFooter"
                style={{
                    position: 'sticky',
                    bottom: 0,
                    backgroundColor: 'white',
                    zIndex: 2,
                    padding: 10,
                    boxShadow: '0 -2px 15px 0 rgba(0,0,0,0.15)',
                }}
            >
                <span>ROWS: </span>
                <select 
                    value={this.state.limit} 
                    onChange={this.updateRowsLimit} 
                    className="form-control form-control-sm"
                >
                    {this.state.rowLimits.map(limitValue => {
                        return <option key={limitValue} value={String(limitValue)}>{limitValue}</option>
                    })}
                </select>
            </div>

        </div>
        );
    }

    fetchData(state, instance) {
        this.setState({
            loading: true,
        });
        axios.get("https://jsonplaceholder.typicode.com/todos?_start="+this.state.start+"&_limit="+this.state.limit)
            .then(res => {
                this.setState({
                    data: res.data,
                    pages: 1,
                    loading: false,
                })
            })
            .catch(function (error) {
                console.log(error)
            })
    }

    renderCell(cellInfo) {
        let className = "rd-td-content";
        if (this.state.gridNavigator.rowIndex === cellInfo.index) {
            className += " rt-td-sel";
        }
        if (this.state.gridNavigator.rowIndex === cellInfo.index 
            && this.state.gridNavigator.columnName === cellInfo.column.id) {
            className += " rt-td-foc";
        }
        if (this.state.gridEditor.rowIndex === cellInfo.index && this.state.gridEditor.columnName === cellInfo.column.id) {
            return (
                <CellEditor 
                    cellInfo={cellInfo}
                    className={className}
                    onCellEdit={this.onCellEdit}
                />
            )
        }
        else {
            let value = typeof cellInfo.value === 'boolean' ? (cellInfo.value ? "Yes" : "No") : cellInfo.value;
            return (
                <div
                    onBlur={e => {
                        console.log("blur")
                        // const data = [...this.state.data];
                        // data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
                        // this.setState({ data });
                    }}
                    onClick={e => {
                        this.setState({
                            gridNavigator: {
                                'rowIndex': cellInfo.index,
                                'columnName': cellInfo.column.id,
                            },
                            gridEditor: {
                                'rowIndex': null,
                                'columnName': null,
                            }
                        })
                    }}
                    onDoubleClick={e => {
                        this.setState({
                            gridEditor: {
                                'rowIndex': cellInfo.index,
                                'columnName': cellInfo.column.id,
                            }
                        })
                    }}
                    className={className}
                >   
                    <span>
                        {value}
                    </span>
                </div>
            );
        }
    }

    renderToolsCell(cellInfo) {
        return(
            <div className="rt-td-tools">
                <a href="/item">
                    <i className="fas fa-pencil-alt"></i>
                </a>
            </div>
        )
    }

    renderEditableCell(cellInfo) {
        return (
            <div
                style={{ backgroundColor: "#fafafa" }}
                contentEditable
                suppressContentEditableWarning
                onBlur={e => {
                    const data = [...this.state.data];
                    data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
                    this.setState({ data });
                }}
                dangerouslySetInnerHTML={{
                    __html: this.state.data[cellInfo.index][cellInfo.column.id]
                }}
            />
        );
    }

    updateRowsLimit(event) {
        this.setState({
            limit: event.target.value*1
        })
    }

    onCellEdit(cellInfo, newValue) {
        const columns = ["id", "userId", "title", "completed"];
        let currentColumnIndex = columns.indexOf(cellInfo.column.id);
        let nextColumnIndex = currentColumnIndex + 1;
        let editedData = [...this.state.editedData];
        let editedItem = {
            "id": cellInfo.row["id"],
        };
        editedItem[cellInfo.column.id] = newValue;
        editedData.push(editedItem);
        this.setState({
            gridNavigator: {
                'rowIndex': cellInfo.index,
                'columnName': columns[nextColumnIndex],
            },
            gridEditor: {
                'rowIndex': cellInfo.index,
                'columnName': columns[nextColumnIndex],     
            },
            editedData: editedData
        })
        console.log(cellInfo)
        console.log(newValue)
    }

}

export default App;
