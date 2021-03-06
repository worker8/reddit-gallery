import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { selectSubreddit, fetchPostsIfNeeded, invalidateSubreddit, fetchNextPagePosts } from '../actions'
import Picker from '../components/Picker'
import Posts from '../components/Posts'
import Photos from '../components/Photos'
import Spinner from '../components/Spinner'
import {Button, IconButton} from 'react-toolbox/lib/button';
import style from '../style/style.scss'

class AsyncApp extends Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.loadMore = this.loadMore.bind(this)
    this.handleRefreshClick = this.handleRefreshClick.bind(this)
  }

  componentDidMount() {
    const { dispatch, selectedSubreddit } = this.props
    dispatch(fetchPostsIfNeeded(selectedSubreddit))
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedSubreddit !== this.props.selectedSubreddit) {
      const { dispatch, selectedSubreddit } = nextProps
      dispatch(fetchPostsIfNeeded(selectedSubreddit))
    }
  }

  handleChange(nextSubreddit) {
    this.props.dispatch(selectSubreddit(nextSubreddit))
  }

  loadMore() {
    const { dispatch, selectedSubreddit } = this.props
    dispatch(fetchNextPagePosts(selectedSubreddit, this.props.loadNextPage))
  }

  handleRefreshClick(e) {
    e.preventDefault()

    const { dispatch, selectedSubreddit } = this.props
    dispatch(invalidateSubreddit(selectedSubreddit))
    dispatch(fetchPostsIfNeeded(selectedSubreddit))
  }

  render() {
    const { selectedSubreddit, posts, isFetching, lastUpdated, loadNextPage } = this.props
    return (
      <article className={style.content}>
        <Picker value={selectedSubreddit}
                onChange={this.handleChange}
                options={[ 'earthporn', 'waterporn', 'cityporn', 'foodporn' ]} />
        <p>
          {lastUpdated &&
            <span>
              Last updated at {new Date(lastUpdated).toLocaleTimeString()}.{' '}
            </span>
          }
          {isFetching &&
            <a href='#' onClick={this.handleRefreshClick}>
              Refresh
            </a>
          }
        </p>
        {!isFetching && posts.length === 0 &&
          <h2>Empty.</h2>
        }
        {posts.length > 0 &&
          <div style={{ opacity: isFetching ? 0.5 : 1 }}>
            <Photos posts={posts} />
          </div>
        }
        {!isFetching &&
          <Button icon='add' label='Load More' accent onClick={this.loadMore}/>
        }
        {isFetching &&
          <Spinner />
        }
      </article>
    )
  }
}

AsyncApp.propTypes = {
  selectedSubreddit: PropTypes.string.isRequired,
  posts: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
  loadNextPage: PropTypes.string,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const { selectedSubreddit, postsBySubreddit } = state
  const {
    isFetching,
    lastUpdated,
    loadNextPage,
    items: posts
  } = postsBySubreddit[selectedSubreddit] || {
    isFetching: true,
    items: []
  }

  return {
    selectedSubreddit,
    posts,
    isFetching,
    lastUpdated,
    loadNextPage
  }
}

export default connect(mapStateToProps)(AsyncApp)
