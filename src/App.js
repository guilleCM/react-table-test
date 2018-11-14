import React, { Component } from 'react';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import axios from "axios";
import $ from 'jquery';

//local resources
import Grid from './Grid.js';
import GridTwo from './GridTwo.js';
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

function isElementInViewPort(elem, offset = 0) {
    let docViewTop = $(window).scrollTop();
    let docViewBottom = docViewTop + $(window).height();
    try {
        let elemTop = $(elem).offset().top - offset;
        let elemBottom = elemTop + $(elem).height();
        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }
    catch(err) {
        return false;
    }
}

class FixedGridHeader extends Component {
    constructor(props) {
        super(props);
        this.handleScroll = this.handleScroll.bind(this);
        //refs
        this.scrollFlag = React.createRef();
        this.fixedHeaderDiv = React.createRef();
    }
    componentDidMount() {
        window.addEventListener('scroll', (e) => this.handleScroll(e));
    }
    componentDidUpdate() {
        console.log("fixedheader")
    }
    render() {
        return(
            <React.Fragment>
                <div ref={this.scrollFlag}></div>
                <div 
                    ref={this.fixedHeaderDiv}
                    className="ReactTable ReactTableFixedGridHeader"
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
                        ref={this.props.fixedHeaderRef}>
                    </div>
                </div>
            </React.Fragment>
        )
    }
    handleScroll(event) {
        const offset = $(this.props.gridTargetRef.current).find('.rt-thead').height();
        if (!isElementInViewPort(this.scrollFlag.current, -offset)) {
            if (this.fixedHeaderDiv.current.style.display !== "block") {
                // console.log("SHOW")
                $(this.fixedHeaderDiv.current).show();
                // const windowScrollX = window.scrollX;
                // let windowScrollY = window.scrollY + offset;
                // window.scroll(windowScrollX, windowScrollY);
            }
            // console.log("ELSE")
        } else {
            // console.log("HIDE")
            $(this.fixedHeaderDiv.current).hide();
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
            expanded: {},
        };
        this.fetchData = this.fetchData.bind(this);
        this.renderCell = this.renderCell.bind(this);
        this.renderEditableCell = this.renderEditableCell.bind(this);
        this.updateRowsLimit = this.updateRowsLimit.bind(this);
        this.onCellEdit = this.onCellEdit.bind(this);
        // this.handleScroll = this.handleScroll.bind(this);
        //refs
        this.fixedHeaderRef = React.createRef();
        this.gridRef = React.createRef();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log("update")
        $(this.gridRef.current).find('.rt-thead').clone().appendTo(this.fixedHeaderRef.current);
        if ($(this.fixedHeaderRef.current).children().length > 1) {
            // for (let child of $(this.fixedHeaderRef.current).children()) {

            // }
            $(this.fixedHeaderRef.current).children().first().remove();
        }
        if(prevState.limit !== this.state.limit) {
            this.fetchData();
        }
    }

    render() {
        const { data, pages, loading } = this.state;
        return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
            </header>
            <div style={{padding: 25}}>
                <Grid />
            </div>
            
            <br/>

            <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#exampleModal">
                    Launch demo modal
            </button>

            <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Modal title</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                            <GridTwo />
                </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                <button type="button" className="btn btn-primary">Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            <br/>

            <div style={{padding: 25}}>
                <GridTwo />
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

    onExpandSubGrid(newExpanded, index, event) {
        console.log("SUBGRID EXPAND")
        let expanded = {...this.state.expanded};
        expanded[index] = true;
        this.setState({
            expanded: expanded
        })
    }
}

export default App;
