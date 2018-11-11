import React, { Component } from 'react';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import axios from "axios";
import $ from 'jquery';

//local resources
import logo from './logo.svg';
import './App.css';

class App extends Component {
    constructor() {
        super();
        this.state = {
            data: [],
            pages: null,
            loading: true,
            start: 0,
            limit: 10,
            gridEditor: {
                'rowIndex': null,
                'columnIndex': null,
            },
            gridNavigator: {
                'rowIndex': null,
                'columnIndex': null,
            },
        };
        this.fetchData = this.fetchData.bind(this);
        this.renderCell = this.renderCell.bind(this);
        this.renderEditableCell = this.renderEditableCell.bind(this);
    }

    render() {
        const { data, pages, loading } = this.state;
        return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
            </header>
            <div>
                <ReactTable
                    columns={[                        
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
                />
            </div>
        </div>
        );
    }

    onClickCell() {

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
                            'cellIndex': $(e.currentTarget.closest('.rt-td')).index(),
                        }
                    })
                }}
            >
                {typeof cellInfo.value === 'boolean' ? (cellInfo.value ? "Yes" : "No") : cellInfo.value}
            </div>
        );
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
}

export default App;
