<script>
import L from 'leaflet'
export default {
  props: {
    map: {
      type: Object,
      default: null
    },
    marker: {
      type: Object,
      default: null
    },
    latLng: {
      type: Object,
      default: null
    },
    options: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      withSlots: false
    }
  },
  mounted() {
    this._initWindow()
  },
  methods: {
    open() {
      if (this.marker) {
        this.marker.bindPopup(this.infoWindow).openPopup()
      }
      if (this.latLng) {
        this.infoWindow.setLatLng(this.latLng).openOn(this.map)
      }
    },
    _initWindow() {
      this.infoWindow = L.popup(this.options)
      let content = ''
      if (this.withSlots) {
        content = this.$el
      }
      this.infoWindow.setContent(content)
    }
  },
  render(h) {
    const slots = this.$slots.default || []
    this.withSlots = !!slots.length
    if (this.withSlots) {
      return h('div', slots)
    }
    return null
  }
}
</script>
