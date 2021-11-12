import ReactDOM from 'react-dom';

export default (Component) => {
    class DecoratedComponent extends Component {

        constructor(props) {
            super(props);
            this.handleBackDropClick = this.handleBackDropClick.bind(this);
        }

        componentWillMount() {
            if (super.componentWillMount) {
                super.componentWillMount();
            }
            document.addEventListener('click', this.handleBackDropClick, false);
        }

        componentWillUnmount() {
            if (super.componentWillUnmount) {
                super.componentWillUnmount();
            }
            document.removeEventListener('click', this.handleBackDropClick, false);
        }

        handleBackDropClick(e) {
            /* eslint-disable react/no-find-dom-node */
            const domNode = ReactDOM.findDOMNode(this);
            if (domNode && domNode.contains(e.target)) {
                return;
            }
            if (this.onBackDrop) {
                this.onBackDrop();
            }
        }

    }
    return DecoratedComponent;
};
