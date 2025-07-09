import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logo from '../img/ncip-logo.png'; // Update path if needed

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 10,
    alignItems: 'center',
  },
  heading1: {
    fontSize: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  heading2: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  banner: {
    backgroundColor: '#C0392B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading3: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 5,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  row1: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  label: {
    width: '35%',
    fontWeight: 'bold',
  },
  colon: {
    width: '5%',
    fontWeight: 'bold',
  },
  valueBold: {
    width: '60%',
    fontWeight: 'bold',
  },
  label1: {
    fontWeight: 'bold',
  },
  value1: {
    fontWeight: 'normal',
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
  },
  cell: {
    padding: 4,
    fontSize: 9,
  },
  headertable: {
    fontWeight: 'bold',
  },
  centerText: {
    textAlign: 'center',
    fontSize: 9,
  },
});

// Reusable Header component
const Header = () => (
  <View>
    <Image src={logo} style={styles.logo} />
    <View style={styles.header}>
      <Text style={styles.heading1}>Republic of the Philippines</Text>
      <Text style={styles.heading1}>Office of the President</Text>
      <Text style={styles.heading2}>National Commission on Indigenous Peoples</Text>
    </View>
  </View>
);

export default function TravelOrderPDF({ data }) {
  const { itineraries = [], transportation = {} } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header />

        {/* Filing Details */}
        <View style={styles.row1}>
          <Text style={styles.label1}>Mode of Filing:</Text>
          <Text style={styles.value1}>{data.mode_of_filing}</Text>
        </View>
        <View style={styles.row1}>
          <Text style={styles.label1}>Date:</Text>
          <Text style={styles.value1}>{data.date_of_filing}</Text>
        </View>
        <View style={styles.row1}>
          <Text style={styles.label1}>Fund Cluster:</Text>
          <Text style={styles.value1}>{data.fund_cluster}</Text>
        </View>

        {/* Travel Order Banner */}
        <View style={styles.banner}>
          <Text style={styles.heading3}>Travel Order</Text>
        </View>

        {/* Travel Order Details */}
        <View style={styles.row}>
          <Text style={styles.label}>Employee</Text>
          <Text style={styles.colon}>:</Text>
          <Text style={styles.valueBold}>{data.employee_names}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date/s of Official Travel</Text>
          <Text style={styles.colon}>:</Text>
          <Text style={styles.valueBold}>
            {data.date_travel_from} to {data.date_travel_to}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Place/s of Travel</Text>
          <Text style={styles.colon}>:</Text>
          <Text style={styles.valueBold}>{data.destination}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Purpose/s of Travel</Text>
          <Text style={styles.colon}>:</Text>
          <Text style={styles.valueBold}>{data.purpose}</Text>
        </View>

        {/* Itinerary Banner */}
        <View style={styles.banner}>
          <Text style={styles.heading3}>Itinerary of Travel</Text>
        </View>

        {/* Itinerary Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, { borderBottomWidth: 1 }]}>  
            <Text style={[styles.cell, styles.headertable, { width: '11%', borderRightWidth: 1 }]}>Date</Text>
            <Text style={[styles.cell, styles.headertable, { width: '15%', borderRightWidth: 1 }]}>Destination</Text>
            <Text style={[styles.cell, styles.headertable, { width: '11%', borderRightWidth: 1 }]}>Departure</Text>
            <Text style={[styles.cell, styles.headertable, { width: '11%', borderRightWidth: 1 }]}>Arrival</Text>
            <Text style={[styles.cell, styles.headertable, { width: '13%', borderRightWidth: 1 }]}>Means of Transportation</Text>
            <Text style={[styles.cell, styles.headertable, { width: '13%', borderRightWidth: 1 }]}>Transpo</Text>
            <Text style={[styles.cell, styles.headertable, { width: '9%', borderRightWidth: 1 }]}>Per Diem</Text>
            <Text style={[styles.cell, styles.headertable, { width: '9%', borderRightWidth: 1 }]}>Others</Text>
            <Text style={[styles.cell, styles.headertable, { width: '8%' }]}>Total</Text>
          </View>

          {/* Table Rows */}
          {itineraries.map((item, idx) => (
            <View key={idx} style={[styles.tableRow, { borderBottomWidth: 1 }]}>  
              <Text style={[styles.cell, { width: '11%', borderRightWidth: 1 }]}>{item.itinerary_date}</Text>
              <Text style={[styles.cell, { width: '15%', borderRightWidth: 1 }]}>{item.destination || ''}</Text>
              <Text style={[styles.cell, { width: '11%', borderRightWidth: 1 }]}>{item.departure_time}</Text>
              <Text style={[styles.cell, { width: '11%', borderRightWidth: 1 }]}>{item.arrival_time}</Text>
              <Text style={[styles.cell, { width: '13%', borderRightWidth: 1 }]}>{item.transportation || 'N/A'}</Text>
              <Text style={[styles.cell, { width: '13%', borderRightWidth: 1 }]}>{item.transportation_allowance || '0.00'}</Text>
              <Text style={[styles.cell, { width: '9%', borderRightWidth: 1 }]}>{item.per_diem || '0.00'}</Text>
              <Text style={[styles.cell, { width: '9%', borderRightWidth: 1 }]}>{item.other_expense || '0.00'}</Text>
              <Text style={[styles.cell, { width: '8%' }]}>{item.total_amount || '0.00'}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
