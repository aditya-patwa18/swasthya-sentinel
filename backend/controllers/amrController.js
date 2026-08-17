const ClinicalReport = require('../models/ClinicalReport');
const Alert = require('../models/Alert');

// @desc    Get AMR Dashboard KPIs and pathogen susceptibility tables
// @route   GET /api/amr/overview
// @access  Private (Authority, Admin)
exports.getAMROverview = async (req, res) => {
  try {
    // 1. Calculate general AMR KPIs
    const amrSignalsCount = await Alert.countDocuments({
      type: 'AMR Signal',
      status: { $in: ['New', 'Under Investigation'] }
    });

    // Total isolates with lab test performed
    const totalIsolates = await ClinicalReport.countDocuments({ labPerformed: true });

    // Resistant isolates (count reports with resistance === 'Resistant')
    const resistantIsolates = await ClinicalReport.countDocuments({
      labPerformed: true,
      resistance: 'Resistant'
    });

    // Antibiotic usage (count reports with antibioticPrescribed = true)
    const totalReports = await ClinicalReport.countDocuments();
    const antibioticReports = await ClinicalReport.countDocuments({ antibioticPrescribed: true });
    const usagePercentage = totalReports > 0 ? Math.round((antibioticReports / totalReports) * 100) : 0;

    // 2. Generate Top Resistant Pathogens Table
    // Query all lab records with pathogen specified
    const labReports = await ClinicalReport.find({
      labPerformed: true,
      pathogen: { $ne: '' }
    });

    // Group by pathogen + antibiotic + state
    const groups = {};
    labReports.forEach(r => {
      const key = `${r.pathogen}|${r.antibioticName}|${r.state}`;
      if (!groups[key]) {
        groups[key] = {
          pathogen: r.pathogen,
          antibiotic: r.antibioticName || 'Unknown',
          region: r.state,
          total: 0,
          resistant: 0
        };
      }
      groups[key].total++;
      if (r.resistance === 'Resistant') {
        groups[key].resistant++;
      }
    });

    const pathogenTable = Object.values(groups)
      .map(g => ({
        pathogen: g.pathogen,
        antibiotic: g.antibiotic,
        region: g.region,
        isolatesTested: g.total,
        resistanceRate: Math.round((g.resistant / g.total) * 100)
      }))
      .filter(p => p.isolatesTested >= 2) // filter out singular sporadic reports
      .sort((a, b) => b.resistanceRate - a.resistanceRate);

    res.status(200).json({
      success: true,
      stats: {
        activeAMRSignals: amrSignalsCount,
        totalIsolates,
        resistantIsolates,
        antibioticPrescribingRate: usagePercentage
      },
      pathogenTable
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get antibiotic prescription trends grouped by class
// @route   GET /api/amr/trends
// @access  Private (Authority, Admin)
exports.getAMRTrends = async (req, res) => {
  try {
    const days = 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Group prescriptions by date and antibioticClass
    const prescribingTrends = await ClinicalReport.aggregate([
      {
        $match: {
          antibioticPrescribed: true,
          reportDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$reportDate' } },
            class: '$antibioticClass'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Format for charts
    const formattedMap = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i + 1);
      const dateStr = d.toISOString().split('T')[0];
      formattedMap[dateStr] = {
        date: dateStr,
        Penicillins: 0,
        Cephalosporins: 0,
        Fluoroquinolones: 0,
        Macrolides: 0,
        Aminoglycosides: 0,
        Other: 0
      };
    }

    prescribingTrends.forEach(item => {
      const { date, class: abClass } = item._id;
      const cleanClass = abClass || 'Other';
      if (formattedMap[date]) {
        formattedMap[date][cleanClass] = item.count;
      }
    });

    const trends = Object.values(formattedMap).sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      success: true,
      trends
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
