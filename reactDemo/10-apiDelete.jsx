//主组件
var MainBox=React.createClass({
	getInitialState:function(){
		return ({
				data:[],
				modifyData:false,		//需要编辑的数据
				allChecked:false		//是否为全选状态
			})
	},
	//选择行
	handleSelectRow:function(id){
		var data=this.state.data;
		for (var i in data){
			if (data[i].id == id){
				data[i].selected = data[i].selected === 1 ? 0 :1;
				break;
			}
		}
		this.setState({data},function(){
			this.handleAllChecked();
		});
	},
	//显示行数据
	handleShowRow:function(id){
		var modifyData=this.state.data.filter(function(item){
			return item.id==id;
		})[0];
		this.setState({modifyData});
	},
	//取消编辑
	handleCancelEdit:function(){
		this.setState({modifyData:false});
	},
	//删除行
	handleDeleteRow:function(id){
		if (!(id instanceof Array)){
			id=[id];
		}
		var data=this.state.data;
		var data=data.filter(function(item){
			return id.indexOf(item.id)<0;
		});
		this.setState({data},function(){
			this.handleAllChecked();
		});
	},
	//添加行数据
	handleAddRow:function(obj){
		var data=this.state.data;
		data= data.concat([obj]);
		this.setState({data},function(){
			this.handleAllChecked();
		});
	},
	//修改行数据
	handleModifyRow:function(obj){
		var data=this.state.data;
		var mData=this.state.modifyData;
		data=data.map(function(item){
			if (item.id === mData.id){
				obj.selected = item.selected	//保留被选中的状态
				return obj;
			}else{
				return item;
			}
		});
		this.setState({data});
		this.setState({modifyData:false});
	},
	//是否被全选
	handleAllChecked:function(){
		var allChecked=false;
		var data = this.state.data;
		var selectData=data.filter(function(item){
			return item.selected;
		})
		if (data.length && data.length === selectData.length){
			allChecked=true;
		}
		this.setState({allChecked:allChecked});
	},
	//全选，反全选，反选
	handleAllSelected:function(state){
		var k=0;
		var data=this.state.data.map(function(item){
			if (typeof(state) === "boolean"){
				item.selected =state ? 1 : 0;
			}else{
				//反选
				item.selected =item.selected ? 0 : 1;
				if (item.selected){
					k++;
				}
			}
			return item;
		});
		if (data.length && data.length ==k){
			state=true;
		}
		this.setState({data},function(){
			this.setState({allChecked:state});
		})
	},
	//请求接口数据
	handleAjax:function(config, callback){
		if (!config && !config.url){
			return ;
		}
		$.ajax({
			url: config.url ? config.url : config,
			type: config.type ? config.type : "get",
			data: config.data ? config.data : {},
			dataType: config.dataType ? config.dataType : "json",
			success:function(data){
				callback(data);
			}
		})
	},
	//请求列表数据
	requestDataList:function(config){
		this.handleAjax(config, function(data){
			this.setState({data:data.list});
		}.bind(this));
	},
	//第一次渲染DOM时初始化请求接口数据
	componentWillMount:function(){
		this.requestDataList("api/index.php")
	},
	render:function(){
		return (
			<div>
				<h2>ReactJS实例·班级信息表</h2>
				<div>
					<DataList 
						data={this.state.data}
						select={this.handleSelectRow}
						delete={this.handleDeleteRow}
						allChecked={this.state.allChecked}
						allSelected={this.handleAllSelected}
						showRow={this.handleShowRow}
						ajax={this.handleAjax}
						requestDataList={this.requestDataList}
						/>
					<AddList 
						modifyData={this.state.modifyData}
						add={this.handleAddRow} 
						modify={this.handleModifyRow}
						cancelEdit={this.handleCancelEdit}
						ajax={this.handleAjax}
						requestDataList={this.requestDataList}
						/>
				</div>
			</div>
		)
	}
});

//数据列表组件
var DataList=React.createClass({
	onChange:function(){
		var checked=this.props.allChecked ? false : true ;
		this.props.allSelected(checked);
	},
	onMouseUp:function(event){
		if (event.button===2){
			this.props.allSelected();
		}
	},
	delMultiselect:function(){
		var data=this.props.data;
		var ids=[];
		for (var i=0;i<data.length;i++){
			if (data[i].selected === 1){
				ids.push(data[i].id);
			}
		}
		if (window.confirm("确定要删除选中的数据吗?")){
			var config = {
				url:"api/delete.php",
				data:{
					id: ids.join(",")
				}
			}
			this.props.ajax(config, function(){
				//this.props.delete(ids);
				this.props.requestDataList("api/index.php");
			}.bind(this));
			
		}
	},
	onContextMenu:function(event){
		event.preventDefault();
		return false;
	},
	render:function(){
		var checked = this.props.allChecked;
		var datalist=this.props.data.map(function(item){
			return (
				<DataRow
					id={item.id}
					name={item.name}
					num={item.num}
					teacher={item.teacher}
					time={item.time}
					selected={item.selected}
					select={this.props.select}
					delete={this.props.delete}
					showRow={this.props.showRow}
					ajax={this.props.ajax}
					requestDataList={this.props.requestDataList}
				/>
			)
		},this);
		return (
			<ul onContextMenu={this.onContextMenu} onMouseUp={this.onMouseUp}>
				<li>
					<div><input type="checkbox" checked={checked} onChange={this.onChange} /></div>
					<div><span>班级名称</span></div>
					<div><span>学员人数</span></div>
					<div><span>指导员</span></div>
					<div><span>建班时间</span></div>
					<div>编辑</div>
					<div>操作</div>
				</li>
				{datalist}
				<li>
				<div></div>
				<div><button onClick={this.delMultiselect}>删除选中</button></div>
				</li>
			</ul>
		)
	}
});
//行组件
var DataRow=React.createClass({
	onChange:function(){
		this.props.select(this.props.id);
	},
	editOnClick:function(){
		this.props.showRow(this.props.id);
	},
	delOnClick:function(){
		if (window.confirm("确定要删除 "+ this.props.name +" 吗?")){
			var config = {
				url:"api/delete.php",
				data:{
					id: this.props.id
				}
			}
			this.props.ajax(config, function(){
				//this.props.delete(this.props.id);
				this.props.requestDataList("api/index.php");
			}.bind(this));
		}
	},
	render:function(){
		var checked=false;
		var rowStyle={};
		if (this.props.selected){
			checked=true;
			rowStyle={background:"#EEE"};
		}
		return (
			<li style={rowStyle}>
				<div><input type="checkbox" checked={checked} onChange={this.onChange} /></div>
				<div><span>{this.props.name}</span></div>
				<div><span>{this.props.num}人</span></div>
				<div><span>{this.props.teacher}</span></div>
				<div><span>{this.props.time}</span></div>
				<div><a href="javascript:;" onClick={this.editOnClick}>编辑</a></div>
				<div><a href="javascript:;" onClick={this.delOnClick}>删除</a></div>
			</li>
		)
	}
});

//数据添加组件
var AddList = React.createClass({
	refValue:function(ref){
		return ReactDOM.findDOMNode(this.refs[ref]).value.trim();
	},
	refObj:function(ref){
		return ReactDOM.findDOMNode(this.refs[ref]);
	},
	clearText:function(){
		var Refs=["name","num","teacher","time"];
		for (var i=0; i<Refs.length;i++){
			this.refObj(Refs[i]).value="";
		}
	},
	addList:function(event, id){
		var obj={
			name: this.refValue('name'),
			num: this.refValue('num'),
			teacher: this.refValue('teacher'),
			time: this.refValue('time'),
		}
		if (id && id>0){
			obj.id=id;
		}
		if (!obj.name){
			this.refObj("name").focus();
			return ;
		}
		var config={
			"url":"api/update.php",
			data:obj
		}
		this.props.ajax(config,function(data){
			if (!data.hasError){
				//alert("执行成功");
				this.clearText();
				this.refObj("name").focus();
				if (!id){
					//重新请求列表数据
					this.props.requestDataList("api/index.php");
				}else{
					this.props.modify(obj);
				}
				//执行成功且渲染后随时取消编辑状态
				this.cancelEdit();
			}else{
				//提示API返回的错误信息
				alert(data.errors[0].msg);
			}
		}.bind(this));
				
	},
	//取消编辑
	cancelEdit:function(){
		this.props.cancelEdit();
		this.clearText();
	},
	render:function(){
		var data=this.props.modifyData;
		var styleNone={};
		if (!data.id){
			styleNone={display:"none"};
		}
		return (
			<ol>
				<li><label><u>班级名称：</u><input type="text" ref="name" /></label></li>
				<li><label><u>学员人数：</u><input type="text" ref="num" /></label></li>
				<li><label><u>指导员：</u><input type="text" ref="teacher" /></label></li>
				<li><label><u>建班时间：</u><input type="text" ref="time" /></label></li>
				<li>
				<u></u>
				<button onClick={(ev, id) =>{this.addList(ev, data.id)}}>{data.id ? "编辑" : "添加"}班级信息</button>&nbsp;
				<button onClick={this.cancelEdit} style={styleNone}>取消编辑</button>
				</li>
			</ol>
		)
	},
	//点编辑每次组件更新时填充数据
	componentDidUpdate:function(){
		var data = this.props.modifyData;
		if (data){
			var Refs=["name","num","teacher","time"];
			for (var i=0;i<Refs.length;i++){
				this.refObj(Refs[i]).value = data[Refs[i]];
			}
		}
	}
});
ReactDOM.render(
	<MainBox />,
	document.getElementById("demo")
)
